import { useCallback, useState, useEffect } from "react";
import { RouterInput, trpc } from "@/utils/trpc";
import Messages from "./messages";
import { useUser } from "@clerk/clerk-react";
import { RouterOutput } from "@/utils/trpc";
import { useWebSocket } from "@croak/hooks-websocket/useWebSocket";
import {
  ChatMessage,
  WebSocketMessageType,
} from "@croak/hono-crud/src/hono-routes/websocket/web-socket-req-messages-types";
import SlateBox from "./slate-box";

type GetMessages = RouterOutput["getMessages"]["getMessages"];
type SingleMessage = GetMessages["messages"][0];

type Cursor = RouterInput["getMessages"]["getMessages"]["cursor"];

export default function ChatBox({
  workspaceSlug,
  channelId,
  initialCursor,
}: {
  workspaceSlug: string;
  channelId: string;
  initialCursor: Cursor;
}) {
  const utils = trpc.useUtils();
  const { addMessageHandler, removeMessageHandler, websocketId } =
    useWebSocket();

  const [messagesHeight, setMessagesHeight] = useState(500); // Default height
  const { user } = useUser();

  const updateMessagesCache = useCallback(
    (newMessage: SingleMessage) => {
      utils.getMessages.getMessages.setInfiniteData(
        {
          channelId: channelId,
          limit: 100,
          cursor: initialCursor,
        },
        (data) => {
          if (!data) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          return {
            ...data,
            pages: data.pages.map((page, pageIndex) =>
              pageIndex === 0
                ? {
                    ...page,
                    messages: [newMessage, ...page.messages],
                  }
                : page,
            ),
          };
        },
      );
    },
    [channelId, initialCursor, utils],
  );

  useEffect(() => {
    const handleMessage = (message: WebSocketMessageType) => {
      const chatMessage = ChatMessage.safeParse(message);

      if (!chatMessage.success) {
        return;
      }

      if (chatMessage.data.websocketId === websocketId) {
        return;
      }

      if (chatMessage.data.newMessage.channelId === channelId) {
        const data = { message: chatMessage.data.newMessage, user: null };
        updateMessagesCache(data);
      }
    };

    addMessageHandler(handleMessage);

    return () => removeMessageHandler(handleMessage);
  }, [
    addMessageHandler,
    removeMessageHandler,
    channelId,
    workspaceSlug,
    updateMessagesCache,
  ]);

  const createMessage = trpc.createMessage.createMessage.useMutation({
    onMutate: async (opts) => {
      await utils.getMessages.getMessages.cancel();
      const newMessage: SingleMessage = {
        message: {
          channelId: opts.channelId,
          userId: user?.id ?? "unknown",
          createdAt: Date.now() / 1000,
          updatedAt: Date.now() / 1000,
          id: Math.random().toString(),
          deletedAt: null,
          message: opts.messageContent,
        },
        user: {
          userId: user?.id ?? "unknown",
          firstName: user?.firstName ?? "unknown",
          lastName: user?.lastName ?? "name",
          imageUrl: user?.imageUrl ?? null,
        },
      };
      updateMessagesCache(newMessage);
    },
  });

  // Effect to adjust the height of the messages based on the PlaygroundMilkdown height
  useEffect(() => {
    const editorElement = document.querySelector(".playground-wrapper");
    if (!editorElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect;
        const newMessagesHeight = window.innerHeight - height - 175;
        setMessagesHeight(newMessagesHeight);
      }
    });

    resizeObserver.observe(editorElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="relative h-screen">
      <div className="absolute bottom-24 w-full p-4">
        <Messages
          channelId={channelId}
          height={messagesHeight}
          initialCursor={initialCursor}
          isInitialCursorAtBottom={true}
        />
        <div className="playground-wrapper my-2">
          <SlateBox />
        </div>
      </div>
    </div>
  );
}
