import { Button } from "@acme/ui/components/ui/button";
import { Separator } from "@acme/ui/components/ui/separator";
import Message from "./message";
import { RouterInput, RouterOutput, trpc } from "@/utils/trpc";
import { format } from "date-fns";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import SkeletonMessages from "./skeleton-messages";

export default function Messages({
  channelId,
  height,
  initialCursor,
}: {
  channelId: string;
  height: number;
  initialCursor: RouterInput["getMessages"]["getMessages"]["cursor"];
}) {
  const {
    data,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    error,
    isLoading,
  } = trpc.getMessages.getMessages.useInfiniteQuery(
    {
      channelId,
      limit: 50,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      getPreviousPageParam: (firstPage, pages, page) =>
        firstPage.previousCursor,
      initialCursor: initialCursor,
    },
  );

  const { ref: NextPageRef, inView: NextPageInView } = useInView({
    threshold: 0,
  });

  const { ref: PreviousPageRef, inView: PreviousPageInView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (NextPageInView && hasNextPage) {
      console.log("fetching next page");
      fetchNextPage();
    }
  }, [NextPageInView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (PreviousPageInView) {
      console.log("fetching previous page");
      fetchPreviousPage();
    }
  }, [PreviousPageInView, fetchPreviousPage]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return <div>No messages found</div>;
  }

  type Messages = RouterOutput["getMessages"]["getMessages"]["messages"];

  const groupMessagesByDate = (messages: Messages) => {
    return messages.reduce(
      (acc: { [key: string]: typeof messages }, message) => {
        const date = format(new Date(message.message.createdAt), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      },
      {},
    );
  };

  // Combine all messages from all pages into a single array
  const allMessages = data.pages.flatMap((page) => page.messages);
  const groupedMessages = groupMessagesByDate(allMessages);

  return (
    <div>
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
        <>
          <div ref={PreviousPageRef}>
            {hasPreviousPage && <SkeletonMessages />}
          </div>
          {Object.entries(groupedMessages).map(([date, messages], index) => (
            <div key={index} className="messages-section">
              <Separator />

              <div className="sticky top-0 flex w-full items-center justify-center">
                <div className="flex-1"></div>
                <div className="mx-2">
                  <Button
                    variant={"secondary"}
                    size={"sm"}
                    className="date-separator my-8"
                  >
                    {format(new Date(messages[0].message.createdAt), "PPP")}
                  </Button>
                </div>
                <div className="flex-1"></div>
              </div>
              {messages
                .slice()
                .reverse()
                .map((message, index, arr) => (
                  <Message
                    key={message.message.id}
                    message={message.message}
                    previousMessage={arr[index - 1]?.message}
                  />
                ))}
            </div>
          ))}
          {hasNextPage && (
            <div ref={NextPageRef}>
              <SkeletonMessages />
            </div>
          )}
        </>
      </div>
      <Button onClick={() => fetchPreviousPage()}>Previous</Button>
      {/* <div ref={PreviousPageRef}></div> */}
    </div>
  );
}
