import { RenderLeafProps } from "slate-react";

export const Leaf: React.FC<RenderLeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  if (leaf.strong) {
    children = <strong>{children}</strong>;
  }

  if (leaf.inlineCode) {
    children = <code>{children}</code>;
  }

  if (leaf.emphasis) {
    children = <em>{children}</em>;
  }

  if (leaf.delete) {
    children = <del>{children}</del>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export default Leaf;
