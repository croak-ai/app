import { Editor, Transforms } from "slate";
import { CustomElement } from "./slate";

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
