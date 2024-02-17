import Message from "./message";
import { trpc } from "@/utils/trpc";

import InfiniteScroll from "react-infinite-scroll-component";

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
    },
  );

  if (messages.error) {
    return <div>Error: {messages.error.message}</div>;
  }
  if (messages.isLoading) {
    return <div>Loading...</div>;
  }
  if (!messages.data) {
    return <div>No messages found</div>;
  }

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
      <InfiniteScroll
        dataLength={messages.data.pages.length}
        next={() => {
          messages.fetchNextPage();
        }}
        hasMore={messages.hasNextPage}
        style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
        inverse={true} //
        loader={<h4>Loading...</h4>}
        scrollableTarget="scrollableDiv"
      >
        <div className="grid py-4">
          {[...messages.data.pages].reverse().map((page, i) => (
            <div key={i}>
              {/* Reverse the order of messages for each page */}
              {page.messages
                .slice()
                .reverse()
                .map((message, index, arr) => (
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
                ))}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
