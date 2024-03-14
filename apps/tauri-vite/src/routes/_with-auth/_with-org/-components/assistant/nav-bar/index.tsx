"use client";

import { useState } from "react";
import { Button } from "@acme/ui/components/ui/button";
import NavButton from "./nav-button";
import ComboBox from "./Combo-Box";

import { X } from "lucide-react";
import { CirclePlus } from "lucide-react";

export default function NavBar() {
  const [activeButton, setActiveButton] = useState("CHAT");
  //Send activeButton state to navbarButton to refactor in future

  return (
    <div className="relative m-1 w-full px-1">
      <div className="flex max-h-[2rem] w-full items-center justify-between">
        <div className="flex flex-grow px-1">
          {/* <Button
            className={`mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white ${
              activeButton === "CHAT" ? "border-b border-white" : ""
            }`}
            onClick={() => setActiveButton("CHAT")}
          >
            CHAT
          </Button> */}
        </div>

        <ComboBox />
        <Button variant="ghost" size="icon" className="h-[1.6rem] w-[1.6rem]">
          <X className="h-[1.3rem] w-[1.3rem]" />
        </Button>
      </div>
    </div>
  );
}
