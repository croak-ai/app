"use client";
import { cn } from "@acme/ui/lib/utils";
import { Button } from "@acme/ui/components/ui/button";
import { Input } from "@acme/ui/components/ui/input";
import { useState } from "react";
import ChatBox from "./chat-box";
import NavBar from "./nav-bar";

interface AssistantProps {
  setAICollapsed: (collapsed: boolean) => void;
}

export default function Assistant(Props: AssistantProps) {
  const [thread, setThread] = useState("");
  /* Query Assistant with given user message, add Assistant response message to state */

  return (
    <div className="flex h-full w-full flex-col items-center">
      <NavBar setAICollapsed={Props.setAICollapsed} setThread={setThread} />
      <ChatBox activeThread={thread} />
    </div>
  );
}
