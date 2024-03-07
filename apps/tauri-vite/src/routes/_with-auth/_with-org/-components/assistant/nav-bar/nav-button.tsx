import { Button } from "@acme/ui/components/ui/button";
import React from "react";

interface NavButtonProps {
  buttonName: string;
  activeButton: string;
  setActiveButton: React.Dispatch<React.SetStateAction<string>>;
}

export default function NavButton(props: NavButtonProps) {
  return (
    <Button
      className={`mx-2 h-6 rounded-none bg-transparent px-0 text-white hover:bg-transparent hover:text-white ${
        props.activeButton === props.buttonName ? "border-b border-white" : ""
      }`}
      onClick={() => props.setActiveButton(props.buttonName)}
    >
      {props.buttonName}
    </Button>
  );
}
