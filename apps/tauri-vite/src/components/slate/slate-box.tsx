import React, { useCallback, MouseEvent } from "react";
import isHotkey from "is-hotkey";
import {
  Editable,
  useSlate,
  Slate,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { Editor, Transforms, Descendant, Element as SlateElement } from "slate";
import {
  Bold,
  Italic,
  Code,
  Underline,
  // List,
  // ListOrdered,
  Quote,
  // Heading1,
  // Heading2,
  // AlignLeft,
  // AlignCenter,
  // AlignRight,
  // AlignJustify,
  LucideIcon,
  Send,
} from "lucide-react";
import { Button } from "@acme/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/ui/tooltip";

import Leaf from "./Leaf";
import Element from "./Element";
import { Icons } from "@acme/ui/components/bonus/icons";
import {
  CustomEditor,
  // CustomElement,
  CustomElementType,
  CustomMark,
} from "./slate";

const HOTKEYS: Record<string, CustomMark> = {
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

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

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
            <BlockButton
              format="blockquote"
              Icon={Quote}
              tooltipText="Blockquote"
            />
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
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();

                  const mark = HOTKEYS[hotkey];

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

const toggleBlock = (editor: CustomEditor, format: string) => {
  // const isActive = isBlockActive(
  //   editor,
  //   format,
  //   TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
  // );
  // const isList = LIST_TYPES.includes(format);
  // Transforms.unwrapNodes(editor, {
  //   match: (n) =>
  //     !Editor.isEditor(n) &&
  //     SlateElement.isElement(n) &&
  //     LIST_TYPES.includes(n.type) &&
  //     !TEXT_ALIGN_TYPES.includes(format),
  //   split: true,
  // });
  // let newProperties: Partial<SlateElement>;
  // if (TEXT_ALIGN_TYPES.includes(format)) {
  //   newProperties = {
  //     align: isActive
  //       ? undefined
  //       : (format as "left" | "center" | "right" | "justify"),
  //   };
  // } else {
  //   newProperties = {
  //     type: isActive
  //       ? "paragraph"
  //       : isList
  //       ? "listItem"
  //       : (format as CustomElement["type"]),
  //   };
  // }
  // Transforms.setNodes<SlateElement>(editor, newProperties);
  // if (!isActive && isList) {
  //   const block = { type: format as CustomElement["type"], children: [] };
  //   Transforms.wrapNodes(editor, block);
  // }
};

const toggleMark = (editor: CustomEditor, format: CustomMark) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: Editor,
  format: string,
  blockType: string = "type",
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    }),
  );

  return !!match;
};

const isMarkActive = (editor: CustomEditor, format: CustomMark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const BlockButton = ({
  format,
  Icon,
  tooltipText,
}: {
  format: CustomElementType;
  Icon: LucideIcon; // Change here
  tooltipText: string;
}) => {
  const editor = useSlate();
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger>
        <Button
          variant={
            isBlockActive(
              editor,
              format,
              TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
            )
              ? "default"
              : "outline"
          }
          onMouseDown={(event: MouseEvent) => {
            event.preventDefault();
            toggleBlock(editor, format);
          }}
          className="h-6 w-6"
          size="icon"
        >
          <div className="flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};

const MarkButton = ({
  format,
  Icon,
  tooltipText,
}: {
  format: CustomMark;
  Icon: LucideIcon; // Change here
  tooltipText: string;
}) => {
  const editor = useSlate();

  let hotkeyText: string | undefined = undefined;
  for (const hotkey in HOTKEYS) {
    if (HOTKEYS[hotkey] === format) {
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
