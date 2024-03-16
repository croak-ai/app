"use client";

import { useState } from "react";
import { Button } from "@acme/ui/components/ui/button";
import { X, PlusCircle } from "lucide-react";
import ThreadSelection from "./thread-selection";

interface NavBarProps {
  setAICollapsed: (collapsed: boolean) => void;
  setThreadId: (thread: string) => void;
}

export default function NavBar(Props: NavBarProps) {
  const [activeButton, setActiveButton] = useState("CHAT");
  //Send activeButton state to navbarButton to refactor in future

  return (
    <div className="relative m-1 w-full px-1">
      <div className="flex max-h-[2rem] w-full items-center justify-between">
        <div className="flex flex-grow px-1">
          <Button
            className={`mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white ${
              activeButton === "CHAT" ? "border-b border-white" : ""
            }`}
            onClick={() => setActiveButton("CHAT")}
          >
            CHAT
          </Button>
          <Button
            className={`mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white ${
              activeButton === "MORE" ? "border-b border-white" : ""
            }`}
            onClick={() => setActiveButton("MORE")}
          >
            MORE
          </Button>
        </div>

        <ThreadSelection setThread={Props.setThreadId} />
        <Button
          variant="ghost"
          size="icon"
          className="mx-0.5 h-[1.4rem] w-[1.4rem]"
        >
          <PlusCircle className="h-[1.1rem] w-[1.1rem]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="mx-0.5 h-[1.4rem] w-[1.4rem]"
          onClick={() => Props.setAICollapsed(true)}
        >
          <X className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </div>
    </div>
  );
}
