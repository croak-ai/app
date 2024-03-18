import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@acme/ui/components/ui/avatar";
import { UserPopoverCard } from "@/components/user/user-card";
import { Button } from "@acme/ui/components/ui/button";

interface Message {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  createdAt: number;
  message: string;
}

interface MessageProps {
  message: Message;
  previousMessage?: Message;
}
export default function Message({ message, previousMessage }: MessageProps) {
  const {
    userId,
    firstName,
    lastName,
    imageUrl,
    createdAt,
    message: content,
  } = message;

  const effectiveDisplayName =
    `${firstName || ""} ${lastName || ""}`.trim() || userId;

  const effectiveAvatarSrc = imageUrl || "";

  const effectiveFallback = firstName ? firstName[0] : "?";

  let hideUsername = false;
  if (previousMessage && previousMessage.userId === userId) {
    const previousMessageCreatedAt = new Date(previousMessage.createdAt);
    const currentMessageCreatedAt = new Date(createdAt);
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
      <div className="flex items-start gap-4 pt-2">
        <div className="h-8 w-8"></div>{" "}
        {/* Placeholder for Avatar to maintain the same gap */}
        <div className="grid gap-1 text-sm">
          <div className={opacity}>{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 pt-4">
      <Avatar className="h-8 w-8">
        {effectiveAvatarSrc && (
          <AvatarImage alt={effectiveDisplayName} src={effectiveAvatarSrc} />
        )}
        {!effectiveAvatarSrc && (
          <AvatarFallback>{effectiveFallback}</AvatarFallback>
        )}
      </Avatar>
      <div className="grid gap-1 text-sm">
        <div className="flex items-center gap-1 font-medium text-primary">
          <UserPopoverCard userId={userId} side="top">
            <Button variant={"link"} className="m-0 inline border-none p-0">
              {effectiveDisplayName}
            </Button>
          </UserPopoverCard>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(createdAt).toLocaleTimeString()}
          </span>
        </div>
        <div className={opacity}>{content}</div>
      </div>
    </div>
  );
}
