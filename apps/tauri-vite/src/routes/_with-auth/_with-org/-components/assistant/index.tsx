"use client";
import { useState } from "react";
import ChatBox from "./chat-box";
import NavBar from "./nav-bar";

interface AssistantProps {
  setAICollapsed: (collapsed: boolean) => void;
}

export default function Assistant(Props: AssistantProps) {
  /* Pull last thread from local storage or set it to new */
  const [threadId, setThreadId] = useState("new");

  /* Query Assistant with given user message, add Assistant response message to state */

  return (
    <div className="flex h-full w-full flex-col items-center">
      <NavBar setAICollapsed={Props.setAICollapsed} setThreadId={setThreadId} />
      <ChatBox threadId={threadId} setThreadId={setThreadId} />
    </div>
  );
}
