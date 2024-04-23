import React, {
  useCallback,
  MouseEvent,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserSearchCombobox } from "../user/select-users-combo-box";
import isHotkey from "is-hotkey";
import {
  Editable,
  useSlate,
  Slate,
  RenderElementProps,
  RenderLeafProps,
  ReactEditor,
} from "slate-react";
import { Editor, Descendant, Range } from "slate";
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
import { CustomEditor, CustomMark, MentionElement } from "./slate";
import { Transforms } from "slate";
import ReactDOM from "react-dom";
import { trpc } from "@/utils/trpc";
import { Avatar, AvatarImage } from "@acme/ui/components/ui/avatar";

const Portal = ({ children }: { children?: ReactNode }) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

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
  const ref = useRef<HTMLDivElement | null>(null);
  const [target, setTarget] = useState<Range | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isFetching } = trpc.searchUsers.searchUsers.useQuery(
    {
      zSearch: search,
    },
    { enabled: search.length > 0 },
  );

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  );
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    [],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (target && data && data.length > 0) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            const prevIndex = index >= data.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            return;
          case "ArrowUp":
            event.preventDefault();
            const nextIndex = index <= 0 ? data.length - 1 : index - 1;
            setIndex(nextIndex);
            return;
          case "Tab":
          case "Enter":
            event.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, data[index].userId);
            setTarget(undefined);
            return;
          case "Escape":
            event.preventDefault();
            setTarget(undefined);
            return;
        }
      }

      if (isHotkey(SEND_KEY, event)) {
        event.preventDefault();
        if (onSend) {
          onSend();
        }
      }
    },
    [data, editor, index, target],
  );

  useEffect(() => {
    if (target && data && data.length > 0) {
      const el = ref.current;
      if (!el) return;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      el.style.top = `${rect.top + window.pageYOffset - 54}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [data?.length, editor, index, search, target]);

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
    <div>
      {target && data && data.length > 0 && (
        <Portal>
          <div
            ref={ref}
            className="absolute bottom-full left-0 z-10 flex flex-col-reverse  p-1"
            data-cy="mentions-portal"
          >
            <div>
              {data.map((user, i) => (
                <Button
                  key={user.userId}
                  onClick={() => {
                    Transforms.select(editor, target);
                    insertMention(editor, user.userId);
                    setTarget(undefined);
                  }}
                  size="sm"
                  variant={i === index ? "secondary" : "outline"}
                  className="mb-2 flex w-64 items-center justify-between"
                >
                  <div className="flex items-center">
                    <Avatar className="mr-2 h-4 w-4">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    </Avatar>
                    {user.firstName} {user.lastName}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Portal>
      )}
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={() => {
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: "word" });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText =
              beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
            const after = Editor.after(editor, start);
            const afterRange = Editor.range(editor, start, after);
            const afterText = Editor.string(editor, afterRange);
            const afterMatch = afterText.match(/^(\s|$)/);

            if (beforeMatch && afterMatch) {
              setTarget(beforeRange);
              setSearch(beforeMatch[1]);
              setIndex(0);
              return;
            }
          }

          setTarget(undefined);
        }}
      >
        <div className="h-full rounded-lg border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b p-2">
            <div className="flex flex-row flex-wrap gap-2">
              <MarkButton format="strong" Icon={Bold} tooltipText="Bold" />
              <MarkButton
                format="emphasis"
                Icon={Italic}
                tooltipText="Italic"
              />
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
              onChange={() => {
                const { selection } = editor;

                if (selection && Range.isCollapsed(selection)) {
                  const [start] = Range.edges(selection);
                  const wordBefore = Editor.before(editor, start, {
                    unit: "word",
                  });
                  const before =
                    wordBefore && Editor.before(editor, wordBefore);
                  const beforeRange =
                    before && Editor.range(editor, before, start);
                  const beforeText =
                    beforeRange && Editor.string(editor, beforeRange);
                  const beforeMatch =
                    beforeText && beforeText.match(/^@(\w+)$/);
                  const after = Editor.after(editor, start);
                  const afterRange = Editor.range(editor, start, after);
                  const afterText = Editor.string(editor, afterRange);
                  const afterMatch = afterText.match(/^(\s|$)/);

                  if (beforeMatch && afterMatch) {
                    console.log("hello");
                    setTarget(beforeRange);
                    setSearch(beforeMatch[1]);
                    setIndex(0);
                    return;
                  }
                }

                setTarget(undefined);
              }}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      </Slate>
    </div>
  );
};

const insertMention = (editor: CustomEditor, character: string) => {
  const mention: MentionElement = {
    type: "mention",
    character,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
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
