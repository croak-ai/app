// import { Editor, Transforms, Range, createEditor, Descendant } from "slate";

// const withMentions = (editor: Editor) => {
//   const { isInline, isVoid, markableVoid } = editor;

//   editor.isInline = (element) => {
//     return element.type === "mention" ? true : isInline(element);
//   };

//   editor.isVoid = (element) => {
//     return element.type === "mention" ? true : isVoid(element);
//   };

//   editor.markableVoid = (element) => {
//     return element.type === "mention" || markableVoid(element);
//   };

//   return editor;
// };

// const insertMention = (editor: Editor, character: CharacterData) => {
//     const mention: MentionElement = {
//       type: 'mention',
//       character,
//       children: [{ text: '' }],
//     }
//     Transforms.insertNodes(editor, mention)
//     Transforms.move(editor)
//   }
