import { Descendant, BaseEditor, BaseRange, Range, Element } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type ParagraphElement = {
  type: "paragraph";
  children: Descendant[];
};

export type BreakElement = {
  type: "break";
  children: EmptyText[];
};

export type HeadingElement = {
  type: "heading";
  depth: number;
  children: Descendant[];
};

export type ThematicBreakElement = {
  type: "thematicBreak";
  children: EmptyText[];
};

export type BlockQuoteElement = {
  type: "blockquote";
  children: Descendant[];
};

export type ListElement = {
  type: "list";
  ordered: boolean;
  children: Descendant[];
};

export type ListItemElement = {
  type: "listItem";
  checked?: boolean;
  children: Descendant[];
};

export type TableElement = {
  type: "table";
  children: TableRow[];
};

export type TableRowElement = {
  type: "tableRow";
  children: TableCell[];
};

export type TableCellElement = {
  type: "tableCell";
  children: CustomText[];
};

export type HtmlElement = {
  type: "html";
  children: CustomText[];
};

export type CodeElement = {
  type: "code";
  lang: string;
  children: CustomText[];
};

export type YamlElement = {
  type: "yaml";
  children: CustomText[];
};

export type TomlElement = {
  type: "toml";
  children: CustomText[];
};

export type LinkElement = {
  type: "link";
  url: string;
  title?: string;
  children: Descendant[];
};

export type ImageElement = {
  type: "image";
  url: string;
  title?: string;
  alt?: string;
  children: EmptyText[];
};

export type MentionElement = {
  type: "mention";
  character: string;
  children: CustomText[];
};

type CustomElement =
  | ParagraphElement
  | BreakElement
  | HeadingElement
  | ThematicBreakElement
  | BlockQuoteElement
  | ListElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | HtmlElement
  | CodeElement
  | YamlElement
  | TomlElement
  | LinkElement
  | ImageElement
  | MentionElement;

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  text: string;
  strong?: boolean;
  inlineCode?: boolean;
  emphasis?: boolean;
  delete?: boolean;
  underline?: boolean;
};

export type CustomElementType = CustomElement["type"];

export type CustomMark = Exclude<keyof CustomText, "text">;

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
  };

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}
