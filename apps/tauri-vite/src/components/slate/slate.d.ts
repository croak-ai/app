export type CustomElement = {
  type:
    | "paragraph"
    | "heading"
    | "thematicBreak"
    | "blockquote"
    | "list"
    | "listItem"
    | "table"
    | "tableRow"
    | "tableCell"
    | "html"
    | "code"
    | "yaml"
    | "toml"
    | "link"
    | "image"
    | "break";
  children: CustomText[];
  align?: "left" | "center" | "right" | "justify";
  depth?: number;
  ordered?: boolean;
  url?: string;
  title?: string;
  alt?: string;
  lang?: string;
  checked?: boolean;
};

export type CustomElementType = CustomElement["type"];

export type CustomText = {
  text: string;
  strong?: boolean;
  inlineCode?: boolean;
  emphasis?: boolean;
  delete?: boolean;
  underline?: boolean;
};

export type CustomMark = Exclude<keyof CustomText, "text">;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
