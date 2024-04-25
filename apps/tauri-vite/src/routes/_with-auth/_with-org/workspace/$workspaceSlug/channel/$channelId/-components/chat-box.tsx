import { useCallback, useState, useEffect, useMemo } from "react";
import { RouterInput, trpc } from "@/utils/trpc";
import Messages from "./messages";
import { useUser } from "@clerk/clerk-react";
import { RouterOutput } from "@/utils/trpc";
import { useWebSocket } from "@croak/hooks-websocket/useWebSocket";
import {
  ChatMessage,
  WebSocketMessageType,
} from "@croak/hono-crud/src/hono-routes/websocket/web-socket-req-messages-types";
import SlateBox from "@/components/slate/slate-box";
import { clearEditor, withMentions } from "@/components/slate/helpers";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
import { createEditor, Node } from "slate";

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

  const { user } = useUser();

  const editor = useMemo(
    () => withMentions(withHistory(withReact(createEditor()))),
    [],
  );

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
      clearEditor(editor);
    },
  });

  return (
    <div className="flex h-full w-full grow flex-col gap-6 overflow-y-auto rounded-sm p-2">
      <Messages
        channelId={channelId}
        initialCursor={initialCursor}
        isInitialCursorAtBottom={true}
      />

      <div className=" my-6">
        <SlateBox
          editor={editor}
          onSend={() => {
            const message = editor.children.map((child) => child);

            const plaintext = message.map((n) => Node.string(n)).join("");
            if (plaintext === "") {
              clearEditor(editor);
              return;
            }

            createMessage.mutate({
              channelId,
              messageContent: JSON.stringify(editor.children),
              workspaceSlug,
              websocketId,
            });
          }}
        />
      </div>
    </div>
  );
}
