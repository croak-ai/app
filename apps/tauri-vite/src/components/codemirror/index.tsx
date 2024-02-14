import { useTheme } from "@/theme";
import type { MutableRefObject } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createCodeMirrorState, createCodeMirrorView } from "./setup";

export interface CodemirrorProps {
  content: string;
  onChange: (getString: () => string) => void;
  lock: MutableRefObject<boolean>;
}
export interface CodemirrorRef {
  update: (markdown: string) => void;
}
export const Codemirror = forwardRef<CodemirrorRef, CodemirrorProps>(
  ({ content, onChange, lock }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<ReturnType<typeof createCodeMirrorView>>();
    const { theme } = useTheme();

    useEffect(() => {
      if (!divRef.current) return;

      const editor = createCodeMirrorView({
        root: divRef.current,
        onChange,
        lock,
        content,
        dark: theme === "dark",
      });
      editorRef.current = editor;

      return () => {
        editor.destroy();
      };
    }, [onChange, content, lock, theme]);

    useImperativeHandle(ref, () => ({
      update: (content: string) => {
        const { current } = editorRef;
        if (!current) return;

        const state = createCodeMirrorState({
          onChange,
          lock,
          dark: theme === "dark",
          content,
        });
        current.setState(state);
      },
    }));

    return <div className="h-full bg-gray-50 dark:bg-gray-900" ref={divRef} />;
  },
);
Codemirror.displayName = "Codemirror";
