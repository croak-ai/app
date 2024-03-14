"use client";

import { useState } from "react";
import { Button } from "@acme/ui/components/ui/button";
import NavButton from "./nav-button";
import ComboBox from "./Combo-Box";

export default function NavBar() {
  const [activeButton, setActiveButton] = useState("CHAT");
  //Send activeButton state to navbarButton to refactor in future

  return (
    <div className="relative m-1 w-full">
      <div className="flex w-full items-center justify-between">
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
        <Button className="mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white">
          X
        </Button>
      </div>
    </div>
  );
}
