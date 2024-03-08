"use client";

import { useState } from "react";
import { Button } from "@acme/ui/components/ui/button";
import Dropdown from "./dropdown";

export default function NavBar() {
  const [activeButton, setActiveButton] = useState("CHAT");

  return (
    <div className="m-2 w-full">
      <div className="flex w-full items-center justify-between">
        <div className="flex">
          <Button
            className={`mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white ${
              activeButton === "CHAT" ? "border-b border-white" : ""
            }`}
            onClick={() => setActiveButton("CHAT")}
          >
            CHAT
          </Button>
          <Dropdown
            buttonName="MORE"
            activeButton={activeButton}
            setActiveButton={setActiveButton}
          />
        </div>

        <Button className="mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white">
          X
        </Button>
      </div>
    </div>
  );
}
