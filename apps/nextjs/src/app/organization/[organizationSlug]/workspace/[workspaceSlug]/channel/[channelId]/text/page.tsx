"use client";

import { CodemirrorRef } from "@/components/codemirror";
import Loading from "@acme/ui/components/bonus/loading";
import type { MilkdownRef } from "@/components/playground-editor";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";

const PlaygroundMilkdown = dynamic(
  () =>
    import("@/components/playground-editor").then((module) => ({
      default: module.PlaygroundMilkdown,
    })),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

const ControlPanel = dynamic(
  () =>
    import("@/components/playground/control-panel").then((module) => ({
      default: module.ControlPanel,
    })),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

export default function Playground() {
  /* TODO: This should contain the last message if not sent */
  const [content, setContent] = useState("");

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
    <>
      <div className="m-0 mt-16  border-b">
        <div className="max-h-[calc(50vh-2rem)] overflow-auto overscroll-none ">
          <PlaygroundMilkdown
            milkdownRef={milkdownRef}
            defaultContent={content}
            onChange={onMilkdownChange}
          />
        </div>
        <div className="max-h-[calc(50vh-2rem)] ">
          <ControlPanel
            codemirrorRef={codemirrorRef}
            content={content}
            onChange={onCodemirrorChange}
            lock={lockCodemirror}
          />
        </div>
      </div>
    </>
  );
}
