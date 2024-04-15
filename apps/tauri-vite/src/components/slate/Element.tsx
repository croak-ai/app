import { RenderElementProps } from "slate-react";

export const Element: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote
          className="ml-0 mr-0 border-l-2 border-primary pl-2 italic"
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul className="m-0 ml-8 list-outside list-disc p-0" {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 className="m-0" {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 className="m-0" {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li className="m-0" {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol className="m-0  ml-8 list-outside list-decimal p-0" {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p className="m-0" {...attributes}>
          {children}
        </p>
      );
  }
};

export default Element;
