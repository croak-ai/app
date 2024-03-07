"use client";

import { useState } from "react";
import { Button } from "@acme/ui/components/ui/button";

export default function NavBar() {
  const [activeButton, setActiveButton] = useState("chat");

  return (
    <div className="m-2 w-full">
      <div className="w-full flex-row items-center justify-start">
        <Button
          className={`mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white ${
            activeButton === "chat" ? "border-b border-white" : ""
          }`}
          onClick={() => setActiveButton("chat")}
        >
          CHAT
        </Button>

        <Button
          className={`mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white ${
            activeButton === "more" ? "border-b border-white" : ""
          }`}
          onClick={() => setActiveButton("more")}
        >
          MORE
        </Button>
      </div>
    </div>
  );
}
