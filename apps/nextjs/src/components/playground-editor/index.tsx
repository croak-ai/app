import type { CmdKey } from "@milkdown/core";
import { editorViewCtx, parserCtx } from "@milkdown/core";
import { redoCommand, undoCommand } from "@milkdown/plugin-history";
import {
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
} from "@milkdown/preset-commonmark";
import {
  insertTableCommand,
  toggleStrikethroughCommand,
} from "@milkdown/preset-gfm";
import { Slice } from "@milkdown/prose/model";
import { Milkdown as Editor } from "@milkdown/react";
import { callCommand, getMarkdown } from "@milkdown/utils";
import type { FC, RefObject } from "react";
import { useImperativeHandle, useState } from "react";
import { usePlayground } from "./usePlayground";
import { Shortcuts } from "./shortcuts";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Strikethrough,
  Table,
  List,
  ListOrdered,
  Quote,
  Send,
} from "lucide-react";
import { Button } from "@acme/ui/components/ui/button";

interface MilkdownProps {
  defaultContent: string;
  onChange: (markdown: string) => void;
  milkdownRef: RefObject<MilkdownRef>;
  onSendPressed?: (content: string) => void;
}

export interface MilkdownRef {
  update: (markdown: string) => void;
}

export const PlaygroundMilkdown: FC<MilkdownProps> = ({
  defaultContent,
  onChange,
  milkdownRef,
  onSendPressed,
}) => {
  const { loading, get } = usePlayground(defaultContent, onChange);
  const [displayNoText, setDisplayNoText] = useState(defaultContent === "");

  const getCurrentMarkdown = (): string => {
    const editor = get();
    if (!editor) return "";
    const content = editor.action(getMarkdown());

    return content;
  };

  const onSend = () => {
    if (onSendPressed) {
      onSendPressed(getCurrentMarkdown());
    }
  };

  useImperativeHandle(milkdownRef, () => ({
    update: (markdown: string) => {
      if (loading) return;
      setDisplayNoText(false);
      const editor = get();
      editor?.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const parser = ctx.get(parserCtx);
        const doc = parser(markdown);
        if (!doc) return;
        const state = view.state;
        view.dispatch(
          state.tr.replace(
            0,
            state.doc.content.size,
            new Slice(doc.content, 0, 0),
          ),
        );
      });
    },
  }));

  function call<T>(command: CmdKey<T>, payload?: T) {
    return get()?.action(callCommand(command, payload));
  }

  const shortcuts = [
    { action: () => call(undoCommand.key), icon: Undo, name: "Undo" },
    { action: () => call(redoCommand.key), icon: Redo, name: "Redo" },
    { action: () => call(toggleStrongCommand.key), icon: Bold, name: "Bold" },
    {
      action: () => call(toggleEmphasisCommand.key),
      icon: Italic,
      name: "Italic",
    },
    {
      action: () => call(toggleStrikethroughCommand.key),
      icon: Strikethrough,
      name: "Strikethrough",
    },
    { action: () => call(insertTableCommand.key), icon: Table, name: "Table" },
    {
      action: () => call(wrapInBulletListCommand.key),
      icon: List,
      name: "Bulleted List",
    },
    {
      action: () => call(wrapInOrderedListCommand.key),
      icon: ListOrdered,
      name: "Numbered List",
    },
    {
      action: () => call(wrapInBlockquoteCommand.key),
      icon: Quote,
      name: "Quote",
    },
  ];

  return (
    <div className="relative h-full rounded-lg border bg-background  shadow-sm">
      <div className="flex items-center justify-between border-b  p-2">
        <Shortcuts shortcuts={shortcuts} />
        {/* Send Button */}
        <Button
          onClick={() => {
            onSend();
          }}
          variant={"default"}
          size={"icon"}
          className="h-6 w-6"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {displayNoText && (
        <div className="absolute left-4 top-14 z-0 opacity-60">
          <span>Message in #General</span>
        </div>
      )}
      <div className="relative z-10 m-1 max-h-[calc(50vh-2rem)] overflow-y-auto rounded bg-secondary p-2">
        <Editor />
      </div>
    </div>
  );
};
