import { Editor, Transforms } from "slate";
import { CustomEditor, CustomElement } from "./slate";

export const blankParagraph: CustomElement[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

export const clearEditor = (editor: Editor) => {
  for (let i = 0; i < editor.children.length; i++) {
    Transforms.delete(editor, {
      at: [0],
    });
  }
  Transforms.insertNodes(editor, blankParagraph, {
    at: [0],
  });
  Transforms.select(editor, []);
};

export const withMentions = (editor: CustomEditor) => {
  const { isInline, isVoid, markableVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "mention" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "mention" ? true : isVoid(element);
  };

  editor.markableVoid = (element) => {
    return element.type === "mention" || markableVoid(element);
  };

  return editor;
};
