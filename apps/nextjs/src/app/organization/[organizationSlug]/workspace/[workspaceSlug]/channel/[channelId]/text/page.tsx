"use client";

import { CodemirrorRef } from "@/components/codemirror";
import type { MilkdownRef } from "@/components/playground-editor";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { Switch } from "@acme/ui/components/ui/switch";

const PlaygroundLoading = () => {
  return (
    <div className="">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="mt-2 h-8 w-full" />
    </div>
  );
};
const PlaygroundMilkdown = dynamic(
  () =>
    import("@/components/playground-editor").then((module) => ({
      default: module.PlaygroundMilkdown,
    })),
  {
    ssr: false,
    loading: () => <PlaygroundLoading />,
  },
);

const ControlPanel = dynamic(
  () =>
    import("@/components/playground/control-panel").then((module) => ({
      default: module.ControlPanel,
    })),
  {
    ssr: false,
    loading: () => <PlaygroundLoading />,
  },
);

const isInDevMode = () => {
  return process.env.NODE_ENV === "development";
};

export default function Playground() {
  /* TODO: This should contain the last message if not sent */
  const [content, setContent] = useState("");
  const [devModeEnabled, setDevModeEnabled] = useState(false);

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

        <PlaygroundMilkdown
          milkdownRef={milkdownRef}
          defaultContent={content}
          onChange={onMilkdownChange}
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
