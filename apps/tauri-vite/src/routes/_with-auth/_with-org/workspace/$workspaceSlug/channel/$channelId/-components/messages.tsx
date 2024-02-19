import Message from "./message";
import { trpc } from "@/utils/trpc";
import { format, isSameDay } from "date-fns";
import React, { useEffect } from "react";
import SkeletonMessages from "./skeleton-messages";
import { useInView } from "react-intersection-observer";

export default function Messages({
  channelId,
  height,
}: {
  channelId: string;
  height: number;
}) {
  const messages = trpc.getMessages.getMessages.useInfiniteQuery(
    {
      channelId,
      limit: 50,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
      initialCursor: undefined,
    },
  );

  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    if (inView && messages.hasNextPage) {
      console.log("fetching next page");
      messages.fetchNextPage();
    }
  }, [inView]);

  if (messages.error) {
    return <div>Error: {messages.error.message}</div>;
  }
  if (messages.isLoading) {
    return <div>Loading...</div>;
  }
  if (!messages.data) {
    return <div>No messages found</div>;
  }

  // Function to determine if the message is the first of a new day
  const isFirstMessageOfDay = (
    message: { createdAt: number },
    index: number,
    arr: { createdAt: number }[],
  ) => {
    if (index === 0) return true; // First message in the dataset
    const prevMessageDate = new Date(arr[index - 1].createdAt);
    const messageDate = new Date(message.createdAt);
    return !isSameDay(prevMessageDate, messageDate);
  };

  // Combine all messages from all pages into a single array
  const allMessages = messages.data.pages.flatMap((page) => page.messages);

  return (
    <div
      id="scrollableDiv"
      style={{
        height: height,
        overflow: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        overflowAnchor: "none",
      }}
    >
      <div className="grid py-4">
        {messages.hasNextPage && <SkeletonMessages count={15} />}
        <div ref={ref}></div>
        {allMessages
          .slice()
          .reverse()
          .map((message, index, arr) => (
            <React.Fragment>
              {isFirstMessageOfDay(
                message.message,
                index,
                arr.map((item) => item.message),
              ) && (
                <div className="date-separator sticky top-0">
                  {format(new Date(message.message.createdAt), "PPP")}
                </div>
              )}
              <div>
                <Message
                  key={message.message.id}
                  message={{
                    ...message.message,
                    ...message.user,
                    userId: message.message.userId,
                  }}
                  previousMessage={
                    index > 0
                      ? {
                          ...arr[index - 1].message,
                          ...arr[index - 1].user,
                          userId: arr[index - 1].message.userId,
                        }
                      : undefined
                  }
                />
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
