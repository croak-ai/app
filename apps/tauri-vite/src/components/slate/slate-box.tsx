import React, { useCallback, MouseEvent } from "react";
import isHotkey from "is-hotkey";
import {
  Editable,
  useSlate,
  Slate,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { Editor, Descendant } from "slate";
import { Bold, Italic, Code, Underline, LucideIcon, Send } from "lucide-react";
import { Button } from "@acme/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/ui/tooltip";

import Leaf from "./Leaf";
import Element from "./Element";
import { Icons } from "@acme/ui/components/bonus/icons";
import { CustomEditor, CustomMark } from "./slate";

const markHotkeys: Record<string, CustomMark> = {
  "mod+b": "strong",
  "mod+i": "emphasis",
  "mod+u": "underline",
  "mod+`": "inlineCode",
};

const SEND_KEY = "enter";

function formatHotkeyText(hotkey: string): string {
  let formattedHotkey = hotkey.replace(/\+/g, " ").toUpperCase();

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const isWindows = navigator.platform.toUpperCase().indexOf("WIN") >= 0;
  // Adjust the hotkey text based on the operating system
  if (isMac) {
    return formattedHotkey.replace("MOD", "⌘");
  } else if (isWindows) {
    return formattedHotkey.replace("MOD", "Ctrl");
  } else {
    return formattedHotkey.replace("MOD", "Ctrl");
  }
}

interface RichTextExampleProps {
  editor: CustomEditor;
  onSend?: () => void;
  disabled?: boolean;
}

const RichTextExample: React.FC<RichTextExampleProps> = ({
  editor,
  onSend,
  disabled,
}) => {
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  );
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    [],
  );
  const SendButton = () => {
    if (!onSend) return null;
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button
            onClick={() => onSend()}
            className="h-6 w-6"
            size="icon"
            disabled={disabled}
          >
            <div className="flex items-center justify-center">
              {disabled ? (
                <Icons.spinner className=" h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col items-center justify-center">
            <div>Send Message</div>
            <code className="mt-2 border px-2 ">{SEND_KEY}</code>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <div className="h-full rounded-lg border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b p-2">
          <div className="flex flex-row flex-wrap gap-2">
            <MarkButton format="strong" Icon={Bold} tooltipText="Bold" />
            <MarkButton format="emphasis" Icon={Italic} tooltipText="Italic" />
            <MarkButton
              format="underline"
              Icon={Underline}
              tooltipText="Underline"
            />
            <MarkButton format="inlineCode" Icon={Code} tooltipText="Code" />
          </div>
          <SendButton />
        </div>
        <div>
          <Editable
            className="max-h-[calc(100vh-10rem)] overflow-y-auto rounded bg-secondary p-2"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            spellCheck
            autoFocus
            readOnly={disabled}
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
              for (const hotkey in markHotkeys) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();

                  const mark = markHotkeys[hotkey];

                  toggleMark(editor, mark);
                }
              }
              if (isHotkey(SEND_KEY, event)) {
                event.preventDefault();
                onSend && onSend();
              }
            }}
          />
        </div>
      </div>
    </Slate>
  );
};

const toggleMark = (editor: CustomEditor, format: CustomMark) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: CustomEditor, format: CustomMark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const MarkButton = ({
  format,
  Icon,
  tooltipText,
}: {
  format: CustomMark;
  Icon: LucideIcon;
  tooltipText: string;
}) => {
  const editor = useSlate();

  let hotkeyText: string | undefined = undefined;
  for (const hotkey in markHotkeys) {
    if (markHotkeys[hotkey] === format) {
      hotkeyText = formatHotkeyText(hotkey);
    }
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger>
        <Button
          variant={isMarkActive(editor, format) ? "default" : "outline"}
          onMouseDown={(event: MouseEvent) => {
            event.preventDefault();
            toggleMark(editor, format);
          }}
          className="h-6 w-6"
          size="icon"
        >
          <div className="flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col items-center justify-center">
          <div>{tooltipText}</div>
          <code className="mt-2 border px-2 ">{hotkeyText}</code>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export default RichTextExample;
