import { RenderElementProps } from "slate-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/theme";
import { Button } from "@acme/ui/components/ui/button";
import { MentionElement } from "./slate";
import { cn } from "@acme/ui/lib/utils";

const Mention = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: MentionElement;
}) => {
  const classes = cn(
    "inline-block m-0 px-1 py-[2px] align-baseline text-sm h-6",
  );

  return (
    <Button
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.character.replace(" ", "-")}`}
      className={classes}
      variant={"default"}
      size={"sm"}
    >
      @{element.character}
      {children}
    </Button>
  );
};

export const Element: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const { theme } = useTheme();

  switch (element.type) {
    case "heading": {
      switch (element.depth) {
        case 1:
          return <h1 {...attributes}>{children}</h1>;
        case 2:
          return <h2 {...attributes}>{children}</h2>;
        case 3:
          return <h3 {...attributes}>{children}</h3>;
        case 4:
          return <h4 {...attributes}>{children}</h4>;
        case 5:
          return <h5 {...attributes}>{children}</h5>;
        case 6:
          return <h6 {...attributes}>{children}</h6>;
        default:
          break;
      }
      break;
    }
    case "mention":
      return (
        <Mention
          attributes={attributes}
          children={children}
          element={element}
        />
      );
    case "thematicBreak":
      return <hr />;
    case "blockquote":
      return (
        <blockquote
          className="ml-0 mr-0 border-l-2 border-primary pl-2 italic"
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case "list":
      if (element.ordered) {
        return <ol {...attributes}>{children}</ol>;
      } else {
        return <ul {...attributes}>{children}</ul>;
      }
    case "listItem":
      return (
        <li {...attributes}>
          {element.checked === true ? (
            <input type="checkbox" readOnly checked />
          ) : element.checked === false ? (
            <input type="checkbox" readOnly />
          ) : null}
          {children}
        </li>
      );
    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "tableRow":
      return <tr {...attributes}>{children}</tr>;
    case "tableCell":
      return <td {...attributes}>{children}</td>;
    case "html":
      return (
        <div
          {...attributes}
          dangerouslySetInnerHTML={{
            __html: element.children[0].text as string,
          }}
        />
      );
    case "code":
      return (
        <SyntaxHighlighter
          {...attributes}
          language={element.lang as string}
          style={theme === "dark" ? vscDarkPlus : vs}
        >
          {element.children[0].text}
        </SyntaxHighlighter>
      );
    case "yaml":
      return (
        <SyntaxHighlighter
          {...attributes}
          language="yaml"
          style={theme === "dark" ? vscDarkPlus : vs}
        >
          {element.children[0].text}
        </SyntaxHighlighter>
      );
    case "toml":
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    // case "definition":
    //   break;
    // case "footnoteDefinition":
    //   break;
    case "break":
      return <br />;
    case "link":
      return (
        <Button variant="link" className="mx-0 px-0">
          <a
            {...attributes}
            href={element.url as string}
            title={element.title as string}
          >
            {children}
          </a>
        </Button>
      );
    // case "mention":
    //   return (
    //     <p className="text-primary" {...attributes}>
    //       {children}
    //     </p>
    //   );
    case "image":
      return (
        <>
          <img
            {...attributes}
            src={element.url as string}
            title={element.title as string}
            alt={element.alt as string}
          />
          {children}
        </>
      );
    // case "linkReference":
    //   break;
    // case "imageReference":
    //   break;
    // case "footnoteReference":
    //   break;
    default:
      break;
  }
  return <p {...attributes}>{children}</p>;
};

export default Element;
