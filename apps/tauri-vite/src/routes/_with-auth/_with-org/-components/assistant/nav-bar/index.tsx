"use client";

import { useState } from "react";
import { Button } from "@acme/ui/components/ui/button";
import NavButton from "./nav-button";

export default function NavBar() {
  const [activeButton, setActiveButton] = useState("CHAT");

  return (
    <div className="m-2 w-full">
      <div className="flex w-full items-center justify-between">
        <div className="flex">
          <NavButton
            buttonName="CHAT"
            activeButton={activeButton}
            setActiveButton={setActiveButton}
          />
          <NavButton
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
