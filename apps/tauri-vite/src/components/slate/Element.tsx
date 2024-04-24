import { RenderElementProps } from "slate-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/theme";
import { Button } from "@acme/ui/components/ui/button";
import { MentionElement, TimeElement } from "./slate";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { UserPopoverCard } from "../user/user-card";
import { useState } from "react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { Dot } from "lucide-react";

const Mention = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: MentionElement;
}) => {
  const [userCardOpen, setUserCardOpen] = useState(false);

  const { data, isLoading } = trpc.getUserNameImage.getUserNameImage.useQuery({
    userId: element.character,
  });

  const UserDetails = () => {
    if (isLoading) {
      return <Skeleton className="h-4 w-12 rounded-full" />;
    }

    if (!data) {
      return (
        <div>
          <div>
            <span className="mr-1">@</span>
            <span className="font-bold text-destructive">Unknown User</span>
          </div>
        </div>
      );
    }

    return (
      <div>
        <UserPopoverCard
          userId={element.character}
          open={userCardOpen}
          setOpen={setUserCardOpen}
          side="top"
        >
          <div>
            <span className="mr-1">@</span>
            {data.firstName} {data.lastName}
          </div>
        </UserPopoverCard>
      </div>
    );
  };

  return (
    <Button
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.character.replace(" ", "-")}`}
      className=" mr-1 inline-block h-6 px-1  align-baseline text-sm "
      variant={"outline"}
      size={"sm"}
      onClick={() => setUserCardOpen(!userCardOpen)}
    >
      <UserDetails />
      {children}
    </Button>
  );
};

const TimeComponent = ({
  attributes,
  element,
}: {
  attributes: any;
  element: TimeElement;
}) => {
  const date = new Date(element.epoch_sec * 1000);
  return (
    <Button {...attributes} variant={"link"} className="px-0">
      {formatDistanceToNow(date, {
        addSuffix: true,
      })}
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
    case "paragraph":
      return <p {...attributes}>{children}</p>;
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
    case "time":
      return <TimeComponent attributes={attributes} element={element} />;
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
      if (element.checked === true || element.checked === false) {
        return (
          <li {...attributes} className="flex items-center">
            <input
              type="checkbox"
              readOnly
              checked={element.checked}
              className="mr-2"
            />
            {children}
          </li>
        );
      }
      return (
        <li {...attributes} className="my-2 flex items-center">
          <span className="mr-2">•</span> {children}
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
      return (
        <div>
          <br />
          <br />
        </div>
      );
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
