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
import clsx from "clsx";
import type { FC, RefObject } from "react";
import { useImperativeHandle } from "react";
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
} from "lucide-react";

interface MilkdownProps {
  content: string;
  onChange: (markdown: string) => void;
  milkdownRef: RefObject<MilkdownRef>;
}

export interface MilkdownRef {
  update: (markdown: string) => void;
}

export const PlaygroundMilkdown: FC<MilkdownProps> = ({
  content,
  onChange,
  milkdownRef,
}) => {
  const { loading, get } = usePlayground(content, onChange);

  useImperativeHandle(milkdownRef, () => ({
    update: (markdown: string) => {
      if (loading) return;
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
    <div className="relative h-full pt-10">
      <div className="absolute top-0 h-10 w-full border-b">
        <div className="prose mx-auto flex">
          {/* Undo Button */}
          <Button
            onClick={() => call(undoCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <Undo />
          </Button>
          {/* Redo Button */}
          <Button
            onClick={() => call(redoCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <Redo />
          </Button>
          {/* Bold Format Button */}
          <Button
            onClick={() => call(toggleStrongCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <Bold />
          </Button>
          {/* Italic Format Button */}
          <Button
            onClick={() => call(toggleEmphasisCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <Italic />
          </Button>
          {/* Strikethrough Format Button */}
          <Button
            onClick={() => call(toggleStrikethroughCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <Strikethrough />
          </Button>
          {/* Table Insert Button */}
          <Button
            onClick={() => call(insertTableCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <Table />
          </Button>
          {/* Bulleted List Format Button */}
          <Button
            onClick={() => call(wrapInBulletListCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <List />
          </Button>
          {/* Numbered List Format Button */}
          <Button
            onClick={() => call(wrapInOrderedListCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <ListOrdered />
          </Button>
          {/* Quote Format Button */}
          <Button
            onClick={() => call(wrapInBlockquoteCommand.key)}
            variant={"outline"}
            size={"icon"}
          >
            <Quote />
          </Button>
        </div>

        <div />
      </div>
      <div className="h-full overflow-auto overscroll-none">
        <Editor />
      </div>
    </div>
  );
};
