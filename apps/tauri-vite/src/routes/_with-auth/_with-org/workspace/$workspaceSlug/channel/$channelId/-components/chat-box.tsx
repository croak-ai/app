import { CodemirrorRef } from "@/components/codemirror";
import type { MilkdownRef } from "@/components/playground-editor";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { Switch } from "@acme/ui/components/ui/switch";
import { RouterInput, trpc } from "@/utils/trpc";
import { PlaygroundMilkdown as MessageBox } from "@/components/playground-editor";
import { ControlPanel as DevMessageBoxTools } from "@/components/playground/control-panel";
import Messages from "./messages";
import { useUser } from "@clerk/clerk-react";

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

  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [messagesHeight, setMessagesHeight] = useState(500); // Default height
  const { user } = useUser();

  const createMessage = trpc.createMessage.createMessage.useMutation({
    // onMutate: async (opts) => {
    //   await utils.getMessages.getMessages.cancel();
    //   utils.getMessages.getMessages.setInfiniteData(
    //     {
    //       channelId: channelId,
    //       limit: 100,
    //       cursor: {
    //         createdAt: Date.now(), // Use the current timestamp or the appropriate value
    //         id: "cursor_id", // Replace "cursor_id" with the actual cursor ID you have
    //         direction: "next", // or "previous", depending on your use case
    //       },
    //     },
    //     (data) => {
    //       if (!data) {
    //         return {
    //           pages: [],
    //           pageParams: [],
    //         };
    //       }

    //       const newMessage = {
    //         // Adjust the structure to match your expected message object structure
    //         confirmed: false, // This is the new part
    //         id: -1, // Mock ID for optimistic update
    //         message: {
    //           channelId: parseInt(opts.channelId), // Assuming channelId is a number in your data model
    //           userId: "optimistic_user_id",
    //           createdAt: Date.now(),
    //           updatedAt: Date.now(),
    //           id: Math.random(), // Assuming id is a number in your data model
    //           deletedAt: null, // Assuming this field exists and is nullable
    //           message: opts.messageContent,
    //           messageInChannelNumber: 1, // Example value, adjust as necessary
    //         },
    //         user: {
    //           userId: user?.id ?? "unknown", // Provide a default string value for userId if null
    //           role: "some_role",
    //           firstName: user?.firstName ?? "unknown",
    //           lastName: user?.lastName ?? "name",
    //           email: user?.primaryEmailAddress?.emailAddress ?? "unknown_email",
    //           imageUrl: user?.imageUrl ?? "",
    //           profileImageUrl: user?.imageUrl ?? "",
    //           createdAt: Date.now(),
    //           updatedAt: Date.now(),
    //         },
    //       };

    //       return {
    //         ...data,
    //         pages: data.pages.map((page) => ({
    //           ...page,
    //           messages: [newMessage, ...page.messages],
    //         })),
    //       };
    //     },
    //   );
    // },
    onError: (input, variables, context) => {
      utils.getMessages.getMessages.setInfiniteData(
        {
          channelId: variables.channelId,
          limit: 100,
          cursor: {
            createdAt: Date.now(), // Use the current timestamp or the appropriate value
            id: "cursor_id", // Replace "cursor_id" with the actual cursor ID you have
            direction: "older", // or "previous", depending on your use case
          },
        },
        () => ({
          pages: [],
          pageParams: [],
        }),
      );
    },
    // onSettled: () => {
    //   utils.getMessages.getMessages.invalidate();
    // },
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

      await createMessage.mutate({
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
    [],
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

        <div className="playground-wrapper my-2">{MemoizedMessageBox}</div>
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
      </div>
    </div>
  );
}
