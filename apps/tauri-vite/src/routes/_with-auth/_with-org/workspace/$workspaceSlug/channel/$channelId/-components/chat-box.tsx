"use client";

import { CodemirrorRef } from "@/components/codemirror";
import type { MilkdownRef } from "@/components/playground-editor";
import { useCallback, useRef, useState } from "react";
import { Switch } from "@acme/ui/components/ui/switch";
import { trpc } from "@/utils/trpc";
import { PlaygroundMilkdown } from "@/components/playground-editor";
import { ControlPanel } from "@/components/playground/control-panel";
import Messages from "./messages";

const isInDevMode = () => {
  return process.env.NODE_ENV === "development";
};

export default function ChatBox({
  workspaceSlug,
  channelId,
}: {
  workspaceSlug: string;
  channelId: string;
}) {
  /* TODO: This should contain the last message if not sent */
  const [content] = useState("");
  const [devModeEnabled, setDevModeEnabled] = useState(false);

  const createMessage = trpc.createMessage.createMessage.useMutation();

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
    },
    [workspaceSlug, channelId, createMessage],
  );

  return (
    <div className="relative h-screen">
      <div className="absolute bottom-24 w-full p-4">
        {devModeEnabled && (
          <ControlPanel
            codemirrorRef={codemirrorRef}
            content={content}
            onChange={onCodemirrorChange}
            lock={lockCodemirror}
          />
        )}

        <Messages channelId={channelId} />

        <PlaygroundMilkdown
          milkdownRef={milkdownRef}
          defaultContent={content}
          onChange={onMilkdownChange}
          onSendPressed={(content) => {
            sendMessage(content);
          }}
        />
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
