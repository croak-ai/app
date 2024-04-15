import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@acme/ui/components/ui/avatar";
import { UserPopoverCard } from "@/components/user/user-card";
import { Button } from "@acme/ui/components/ui/button";
import { useCallback, useMemo } from "react";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { createEditor } from "slate";
import Leaf from "@/components/slate/Leaf";
import Element from "@/components/slate/Element";

interface Message {
  userId: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  createdAt: number;
  message: string;
}

interface MessageProps {
  message: Message;
  previousMessageUserId?: {
    userId: string | null;
    createdAt: number;
  };
}
export default function Message({
  message,
  previousMessageUserId,
}: MessageProps) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const {
    userId,
    firstName,
    lastName,
    imageUrl,
    createdAt,
    message: content,
  } = message;

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  );
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    [],
  );

  try {
    let parsedContent = JSON.parse(content);

    // Ensure parsedContent is an array - if not, wrap it in an array...
    // This is because Slate expects an array of nodes.
    const initialValue = Array.isArray(parsedContent)
      ? parsedContent
      : [{ type: "paragraph", children: [{ text: parsedContent.toString() }] }];

    let effectiveDisplayName = "Unknown User";

    if (userId) {
      effectiveDisplayName = "Unknonw Name";
    }

    if (firstName || lastName) {
      effectiveDisplayName = `${firstName || ""} ${lastName || ""}`.trim();
    }

    const effectiveAvatarSrc = imageUrl || "";

    const effectiveFallback = firstName ? firstName[0] : "?";

    let hideUsername = false;
    if (
      previousMessageUserId &&
      previousMessageUserId.userId &&
      previousMessageUserId.userId === userId
    ) {
      const previousMessageCreatedAt = new Date(
        previousMessageUserId.createdAt * 1000,
      );
      const currentMessageCreatedAt = new Date(createdAt * 1000);
      if (
        currentMessageCreatedAt.getTime() - previousMessageCreatedAt.getTime() <
        3 * 60 * 1000
      ) {
        hideUsername = true;
      }
    }

    const opacity = userId === "optimistic_user_id" ? "opacity-50" : "";

    if (hideUsername) {
      return (
        <div className="flex items-start gap-4 pt-1">
          <div className="mt-3  w-8"></div>
          <div className="grid gap-1 ">
            <div className="flex items-center gap-1 font-medium text-primary">
              <div className="mt-[-1px]"></div>
            </div>
            <Slate editor={editor} initialValue={initialValue}>
              <Editable
                readOnly
                renderLeaf={renderLeaf}
                renderElement={renderElement}
              />
            </Slate>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-4 pt-4">
        <Avatar className="mt-3 h-8 w-8">
          {effectiveAvatarSrc && (
            <AvatarImage alt={effectiveDisplayName} src={effectiveAvatarSrc} />
          )}
          {!effectiveAvatarSrc && (
            <AvatarFallback>{effectiveFallback}</AvatarFallback>
          )}
        </Avatar>
        <div className="grid gap-1 ">
          <div className="flex items-center gap-1 font-medium text-primary">
            <div className="mt-[-1px]">
              {userId ? (
                <UserPopoverCard userId={userId} side="top">
                  <Button
                    variant={"link"}
                    className="m-0 inline border-none p-0"
                  >
                    {effectiveDisplayName}
                  </Button>
                </UserPopoverCard>
              ) : (
                <Button variant={"link"} className="m-0 inline border-none p-0">
                  {effectiveDisplayName}
                </Button>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(createdAt * 1000).toLocaleTimeString()}
            </span>
          </div>
          <div className=" mt-[-10px]">
            <Slate editor={editor} initialValue={initialValue}>
              <Editable
                readOnly
                renderLeaf={renderLeaf}
                renderElement={renderElement}
              />
            </Slate>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <b className="text-destructive">Error parsing message</b>
        <div>{JSON.stringify(message)}</div>
      </div>
    );
  }
}
