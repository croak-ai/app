import { Button } from "@acme/ui/components/ui/button";
import { Separator } from "@acme/ui/components/ui/separator";
import Message from "./message";
import { RouterInput, RouterOutput, trpc } from "@/utils/trpc";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
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
      limit: 100,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      getPreviousPageParam: (firstPage, pages, page) =>
        firstPage.previousCursor,
      initialCursor: initialCursor,
      maxPages: 3,
    },
  );

  const { ref: NextPageRef, inView: NextPageInView } = useInView({
    threshold: 0,
  });

  const { ref: PreviousPageRef, inView: PreviousPageInView } = useInView({
    threshold: 0,
  });

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const nextPageTargetElement = useRef<number | null>(null);
  const previousPageTargetElement = useRef<number | null>(null);

  const scrollToMessageById = (messageId: number) => {
    const messageElement = scrollBoxRef.current?.querySelector(
      `[data-key='${messageId}']`,
    );
    if (messageElement && scrollBoxRef.current) {
      messageElement.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "nearest",
      });
      const padding = 100;
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollTop -= padding;
      }
    }
  };
  const messageInList = (messageId: number) => {
    return Boolean(
      data?.pages.some((page) =>
        page.messages.some((message) => message.message.id === messageId),
      ),
    );
  };

  // This useEffect is used to make sure that the scroll position is maintained
  // See since we have only 2 pages in the query, sometimes the scroll gets messed up during a
  // fetchNextPage or fetchPreviousPage.
  useEffect(() => {
    const newestMessage =
      data?.pages[data.pages.length - 1]?.messages[
        data.pages[data.pages.length - 1].messages.length - 1
      ];

    const oldestMessage = data?.pages[0]?.messages[0];

    if (!oldestMessage || !newestMessage) {
      return;
    }

    if (nextPageTargetElement.current && previousPageTargetElement.current) {
      // This happens if we "lose" the previous page so we should fix the scroll
      if (
        messageInList(nextPageTargetElement.current) &&
        !messageInList(previousPageTargetElement.current)
      ) {
        console.log("scrolling to next page");
        scrollToMessageById(nextPageTargetElement.current);
      }

      // This happens if we "lose" the next page so we should fix the scroll
      if (
        messageInList(previousPageTargetElement.current) &&
        !messageInList(nextPageTargetElement.current)
      ) {
        console.log("scrolling to previous page");
        scrollToMessageById(previousPageTargetElement.current);
      }
    }

    nextPageTargetElement.current = newestMessage.message.id;
    previousPageTargetElement.current = oldestMessage.message.id;
  }, [data]);

  useEffect(() => {
    const fetchNext = async () => {
      if (hasNextPage && NextPageInView) {
        await fetchNextPage();
      }
    };
    fetchNext();
  }, [NextPageInView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    const fetchPrevious = async () => {
      if (hasPreviousPage && PreviousPageInView) {
        await fetchPreviousPage();
      }
    };
    fetchPrevious();
  }, [PreviousPageInView, hasPreviousPage, fetchPreviousPage]);

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
        ref={scrollBoxRef}
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
          {Object.entries(groupedMessages).map(
            ([date, messages], groupIndex) => (
              <div key={groupIndex} className="messages-section">
                <Separator />
                <div className="sticky top-0 flex w-full items-center justify-center">
                  <div className="flex-1"></div>
                  <div className="mx-2">
                    <Button
                      variant={"secondary"}
                      size={"sm"}
                      className="date-separator my-4"
                    >
                      {format(new Date(messages[0].message.createdAt), "PPP")}
                    </Button>
                  </div>
                  <div className="flex-1"></div>
                </div>
                {messages
                  .slice()
                  .reverse()
                  .map((message, messageIndex, arr) => (
                    <div key={message.message.id} data-key={message.message.id}>
                      <Message
                        message={message.message}
                        previousMessage={arr[messageIndex - 1]?.message}
                      />
                    </div>
                  ))}
              </div>
            ),
          )}
          {hasNextPage && (
            <div ref={NextPageRef}>
              <SkeletonMessages />
            </div>
          )}
        </>
      </div>
      {/* <Button onClick={() => fetchPreviousPage()}>Previous</Button> */}
    </div>
  );
}
