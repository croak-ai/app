"use client";
import { useState } from "react";
import ChatBox from "./chat-box";
import NavBar from "./nav-bar";
import { trpc } from "@/utils/trpc";

interface AssistantProps {
  setAICollapsed: (collapsed: boolean) => void;
}

export default function Assistant(Props: AssistantProps) {
  /* Pull last thread from local storage or set it to new on initial load*/
  const savedThreadId = localStorage.getItem("threadId") || "new";
  const [threadId, setThreadId] = useState(savedThreadId);

  const { data, status } =
    trpc.retrieveThreadMessages.retrieveThreadMessages.useQuery(
      {
        zThreadId: threadId,
      },
      { enabled: threadId !== "new" }, // Only fetch data when threadId is not "new"
    );

  if (status === "error") {
    console.log("ERROR fetching threadMessages:", data);
  }

  /* Query Assistant with given user message, add Assistant response message to state */

  return (
    <div className="flex h-full w-full flex-col items-center">
      <NavBar
        threadId={threadId}
        setThreadId={setThreadId}
        setAICollapsed={Props.setAICollapsed}
      />
      {status === "pending" ? (
        <ChatBox
          key={"new"}
          threadId={"new"}
          threadMessages={[]}
          setThreadId={setThreadId}
        />
      ) : (
        <ChatBox
          key={threadId}
          threadId={threadId}
          threadMessages={data || []}
          setThreadId={setThreadId}
        />
      )}
    </div>
  );
}
