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
import { callCommand } from "@milkdown/utils";
import type { FC, RefObject } from "react";
import { useImperativeHandle, useState } from "react";
import { usePlayground } from "./usePlayground";
import { Button } from "@acme/ui/components/ui/button";
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

interface MilkdownProps {
  defaultContent: string;
  onChange: (markdown: string) => void;
  milkdownRef: RefObject<MilkdownRef>;
}

export interface MilkdownRef {
  update: (markdown: string) => void;
}

export const PlaygroundMilkdown: FC<MilkdownProps> = ({
  defaultContent,
  onChange,
  milkdownRef,
}) => {
  const { loading, get } = usePlayground(defaultContent, onChange);
  const [displayNoText, setDisplayNoText] = useState(defaultContent === "");

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

  return (
    <div className="relative h-full rounded-lg border bg-background  shadow-sm">
      <div className="flex items-center justify-between border-b  p-2">
        <div className="flex space-x-1 ">
          {/* Undo Button */}
          <Button
            onClick={() => call(undoCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <Undo className="h-4 w-4" />
          </Button>
          {/* Redo Button */}
          <Button
            onClick={() => call(redoCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <Redo className="h-4 w-4" />
          </Button>
          {/* Bold Format Button */}
          <Button
            onClick={() => call(toggleStrongCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <Bold className="h-4 w-4" />
          </Button>
          {/* Italic Format Button */}
          <Button
            onClick={() => call(toggleEmphasisCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <Italic className="h-4 w-4" />
          </Button>
          {/* Strikethrough Format Button */}
          <Button
            onClick={() => call(toggleStrikethroughCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          {/* Table Insert Button */}
          <Button
            onClick={() => call(insertTableCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <Table className="h-4 w-4" />
          </Button>
          {/* Bulleted List Format Button */}
          <Button
            onClick={() => call(wrapInBulletListCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <List className="h-4 w-4" />
          </Button>
          {/* Numbered List Format Button */}
          <Button
            onClick={() => call(wrapInOrderedListCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          {/* Quote Format Button */}
          <Button
            onClick={() => call(wrapInBlockquoteCommand.key)}
            variant={"ghost"}
            size={"icon"}
            className="h-6 w-6"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>
        {/* Send Button */}
        <Button
          onClick={() => {
            /* TODO: Implement send functionality */
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
      <div className=" m-1 bg-secondary p-2">
        <div className="relative z-10">
          <Editor />
        </div>
      </div>
    </div>
  );
};
