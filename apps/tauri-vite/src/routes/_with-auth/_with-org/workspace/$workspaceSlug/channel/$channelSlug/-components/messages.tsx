import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@acme/ui/components/ui/avatar";

const messagesData = [
  {
    id: 1,
    username: "@ben",
    displayName: "Ben Werner",
    avatarSrc: "/ben.jpg",
    fallback: "BW",
    timestamp: "2:14 PM",
    message: () => (
      <p>
        Hey, I'm loving the new features! I think they're really going to help
        us out. 🚀
      </p>
    ),
  },
  {
    id: 2,
    username: "@nick",
    displayName: "Nick Walsh",
    avatarSrc: "/nick.jpg",
    fallback: "NW",
    timestamp: "2:15 PM",
    message: () => (
      <p>I agree! I think it's going to be a game changer for us.</p>
    ),
  },
  {
    id: 3,
    username: "@nick",
    displayName: "Nick Walsh",
    avatarSrc: "/nick.jpg",
    fallback: "NW",
    timestamp: "2:16 PM",
    message: () => (
      <p>
        By the way, how is the meetings feature coming along? I'm really excited
        about that one.
      </p>
    ),
  },
  {
    id: 4,
    username: "@ben",
    displayName: "Ben Werner",
    avatarSrc: "/ben.jpg",
    fallback: "BW",
    timestamp: "2:17 PM",
    message: () => (
      <>
        <p>It's going well! We're on track for the next release.</p>
        <img
          src="/waiting.png"
          alt="Exciting update preview"
          style={{ maxHeight: "300px" }}
          className="rounded py-2"
        />
      </>
    ),
  },
  {
    id: 5,
    username: "@nick",
    displayName: "Nick Walsh",
    avatarSrc: "/nick.jpg",
    fallback: "NW",
    timestamp: "2:18 PM",
    message: () => <p>Fantastic! Can't wait to see it in action.</p>,
  },
  {
    id: 6,
    username: "@ben",
    displayName: "Ben Werner",
    avatarSrc: "/ben.jpg",
    fallback: "BW",
    timestamp: "2:19 PM",
    message: () => (
      <p>Definitely, it's going to simplify a lot of our current processes.</p>
    ),
  },
  {
    id: 7,
    username: "@nick",
    displayName: "Nick Walsh",
    avatarSrc: "/nick.jpg",
    fallback: "NW",
    timestamp: "2:20 PM",
    message: () => (
      <p>Speaking of, have we addressed the feedback from the last demo?</p>
    ),
  },
  {
    id: 8,
    username: "@ben",
    displayName: "Ben Werner",
    avatarSrc: "/ben.jpg",
    fallback: "BW",
    timestamp: "2:21 PM",
    message: () => (
      <p>
        Yes, most of the concerns have been tackled in this upcoming update.
      </p>
    ),
  },
  {
    id: 9,
    username: "@nick",
    displayName: "Nick Walsh",
    avatarSrc: "/nick.jpg",
    fallback: "NW",
    timestamp: "2:22 PM",
    message: () => (
      <p>Great to hear! How about the integration with the analytics tool?</p>
    ),
  },
  {
    id: 10,
    username: "@ben",
    displayName: "Ben Werner",
    avatarSrc: "/ben.jpg",
    fallback: "BW",
    timestamp: "2:23 PM",
    message: () => (
      <p>That's next on the list. Planning to start on it next week.</p>
    ),
  },
  {
    id: 11,
    username: "@nick",
    displayName: "Nick Walsh",
    avatarSrc: "/nick.jpg",
    fallback: "NW",
    timestamp: "2:24 PM",
    message: () => (
      <p>Perfect, I'll schedule a review session once it's ready.</p>
    ),
  },
];

function Message({
  username,
  displayName,
  avatarSrc,
  fallback,
  timestamp,
  message: MessageComponent,
  hideUsername,
}: {
  username: string;
  displayName: string;
  avatarSrc: string;
  fallback: string;
  timestamp: string;
  message: () => JSX.Element;
  hideUsername: boolean;
}) {
  if (hideUsername) {
    return (
      <div className="flex items-start gap-4 pt-2">
        <div className="h-8 w-8"></div>{" "}
        {/* Placeholder for Avatar to maintain the same gap */}
        <div className="grid gap-1 text-sm">
          <div>
            <MessageComponent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 pt-4">
      <Avatar className="h-8 w-8">
        <AvatarImage alt={username} src={avatarSrc} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1 text-sm">
        <div className="flex items-center gap-1 font-medium text-primary">
          {displayName}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp}
          </span>
        </div>
        <div>
          <MessageComponent />
        </div>
      </div>
    </div>
  );
}
export default function Messages() {
  return (
    <div className="grid py-4">
      {messagesData.map((msg, index, arr) => {
        const hideUsername = !(
          index === 0 || msg.username !== arr[index - 1].username
        );
        return <Message key={msg.id} {...msg} hideUsername={hideUsername} />;
      })}
    </div>
  );
}
