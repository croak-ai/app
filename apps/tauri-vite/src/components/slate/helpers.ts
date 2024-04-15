import { Editor, Transforms } from "slate";

export const blankParagraph = [{ type: "paragraph", children: [{ text: "" }] }];

export const clearEditor = (editor: Editor) => {
  for (const child of editor.children) {
    Transforms.delete(editor, {
      at: [0],
    });
  }
  Transforms.insertNodes(editor, blankParagraph, {
    at: [0],
  });
  Transforms.select(editor, []);
};
