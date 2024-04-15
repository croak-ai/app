import React, { useCallback, useMemo, MouseEvent } from "react";
import { z } from "zod";
import isHotkey from "is-hotkey";
import {
  Editable,
  withReact,
  useSlate,
  Slate,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
  BaseEditor,
  Range,
} from "slate";
import {
  Bold,
  Italic,
  Code,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  LucideIcon,
  Send,
} from "lucide-react";
import { Button } from "@acme/ui/components/ui/button";
import { withHistory } from "slate-history";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/ui/tooltip";

import Leaf from "./Leaf";
import Element from "./Element";

type CustomElement = { type: string; children: CustomText[]; align?: string };
const CustomText = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  code: z.boolean().optional(),
});
type CustomText = z.infer<typeof CustomText>;

const CustomMark = z.enum(["bold", "italic", "underline", "code"]);

type CustomMark = z.infer<typeof CustomMark>;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const HOTKEYS: Record<string, CustomMark> = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
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
  editor: ReactEditor;
  onSend?: () => void;
}

const RichTextExample: React.FC<RichTextExampleProps> = ({
  editor,
  onSend,
}) => {
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    [],
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  );

  const SendButton = () => {
    if (!onSend) return null;
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button onClick={() => onSend()} className="h-6 w-6" size="icon">
            <div className="flex items-center justify-center">
              <Send className="h-4 w-4" />
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
          <div className="flex flex-row flex-wrap">
            <MarkButton format="bold" Icon={Bold} tooltipText="Bold" />
            <MarkButton format="italic" Icon={Italic} tooltipText="Italic" />
            <MarkButton
              format="underline"
              Icon={Underline}
              tooltipText="Underline"
            />
            <MarkButton format="code" Icon={Code} tooltipText="Code" />
            <BlockButton
              format="heading-one"
              Icon={Heading1}
              tooltipText="Heading 1"
            />
            <BlockButton
              format="heading-two"
              Icon={Heading2}
              tooltipText="Heading 2"
            />
            <BlockButton
              format="block-quote"
              Icon={Quote}
              tooltipText="Blockquote"
            />
            <BlockButton
              format="numbered-list"
              Icon={ListOrdered}
              tooltipText="Numbered List"
            />
            <BlockButton
              format="bulleted-list"
              Icon={List}
              tooltipText="Bulleted List"
            />
            <BlockButton
              format="left"
              Icon={AlignLeft}
              tooltipText="Left Align"
            />
            <BlockButton
              format="center"
              Icon={AlignCenter}
              tooltipText="Center Align"
            />
            <BlockButton
              format="right"
              Icon={AlignRight}
              tooltipText="Right Align"
            />
            <BlockButton
              format="justify"
              Icon={AlignJustify}
              tooltipText="Justify"
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

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: CustomMark) => {
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

const isMarkActive = (editor: Editor, format: CustomMark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const BlockButton = ({
  format,
  Icon,
  tooltipText,
}: {
  format: string;
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
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold", bold: true },
      {
        text: ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    align: "center",
    children: [{ text: "Try it out for yourself!" }],
  },
];

export default RichTextExample;
