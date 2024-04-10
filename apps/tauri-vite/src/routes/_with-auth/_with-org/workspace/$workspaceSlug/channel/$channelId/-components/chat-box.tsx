import { CodemirrorRef } from "@/components/codemirror";
import type { MilkdownRef } from "@/components/playground-editor";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { Switch } from "@acme/ui/components/ui/switch";
import { RouterInput, trpc } from "@/utils/trpc";
import { PlaygroundMilkdown as MessageBox } from "@/components/playground-editor";
import { ControlPanel as DevMessageBoxTools } from "@/components/playground/control-panel";
import Messages from "./messages";
import { useUser } from "@clerk/clerk-react";
import { RouterOutput } from "@/utils/trpc";
import { useWebSocket } from "@croak/hooks-websocket/useWebSocket";
import {
  ChatMessage,
  WebSocketMessageType,
} from "@croak/hono-crud/src/hono-routes/websocket/web-socket-req-messages-types";

type GetMessages = RouterOutput["getMessages"]["getMessages"];
type SingleMessage = GetMessages["messages"][0];

const isInDevMode = () => {
  return process.env.NODE_ENV === "development";
};

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

  const [devModeEnabled, setDevModeEnabled] = useState(false);
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

  const lockCodemirror = useRef(false);
  const milkdownRef = useRef<MilkdownRef>(null);
  const codemirrorRef = useRef<CodemirrorRef>(null);

  const onMilkdownChange = useCallback((markdown: string) => {
    const lock = lockCodemirror.current;
    if (lock) return;

    const codemirror = codemirrorRef.current;
    if (!codemirror) return;
    codemirror.update(markdown);
  }, []);

  const onCodemirrorChange = useCallback((getCode: () => string) => {
    const { current } = milkdownRef;
    if (!current) return;
    const value = getCode();
    current.update(value);
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (message.trim() === "") return;

      console.log("ChannelId", channelId);

      await createMessage.mutate({
        websocketId: websocketId,
        workspaceSlug: workspaceSlug,
        channelId: channelId,
        messageContent: message,
      });

      const { current } = milkdownRef;
      if (!current) return;
      current.update("");
    },
    [workspaceSlug, channelId, createMessage, utils],
  );

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

  const MemoizedMessageBox = useMemo(
    () => (
      <MessageBox
        milkdownRef={milkdownRef}
        defaultContent={""}
        onChange={onMilkdownChange}
        onSendPressed={(content) => {
          sendMessage(content);
        }}
      />
    ),
    [channelId],
  );

  const MemoizedDevMessageBoxTools = useMemo(
    () => (
      <DevMessageBoxTools
        codemirrorRef={codemirrorRef}
        content={""}
        onChange={onCodemirrorChange}
        lock={lockCodemirror}
      />
    ),
    [],
  );

  return (
    <div className="relative h-screen">
      <div className="absolute bottom-24 w-full p-4">
        <Messages
          channelId={channelId}
          height={messagesHeight}
          initialCursor={initialCursor}
          isInitialCursorAtBottom={true}
        />
        {devModeEnabled && MemoizedDevMessageBoxTools}
        {isInDevMode() && (
          <div className="flex items-center justify-end">
            <Switch
              checked={devModeEnabled}
              onCheckedChange={setDevModeEnabled}
              className="mr-2"
            />
            <span className="text-sm">Dev Mode</span>
          </div>
        )}
        <div className="playground-wrapper my-2">{MemoizedMessageBox}</div>
      </div>
    </div>
  );
}
