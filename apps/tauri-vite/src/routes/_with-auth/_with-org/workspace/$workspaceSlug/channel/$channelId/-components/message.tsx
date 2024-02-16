import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@acme/ui/components/ui/avatar";

interface Message {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
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
    profileImageUrl,
    createdAt,
    message: content,
  } = message;

  const effectiveDisplayName =
    `${firstName || ""} ${lastName || ""}`.trim() || userId;

  const effectiveAvatarSrc = profileImageUrl || "";

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

  if (hideUsername) {
    return (
      <div className="flex items-start gap-4 pt-2">
        <div className="h-8 w-8"></div>{" "}
        {/* Placeholder for Avatar to maintain the same gap */}
        <div className="grid gap-1 text-sm">
          <div>{content}</div>
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
          {effectiveDisplayName}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(createdAt).toLocaleTimeString()}
          </span>
        </div>
        <div>{content}</div>
      </div>
    </div>
  );
}
