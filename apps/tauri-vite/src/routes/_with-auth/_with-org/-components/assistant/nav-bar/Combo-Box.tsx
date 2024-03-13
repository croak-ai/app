"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { History } from "lucide-react";

import { cn } from "@acme/ui/lib/utils";
import { Button } from "@acme/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@acme/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/components/ui/popover";
import { trpc } from "@/utils/trpc";
import { useEffect, useRef, useState } from "react";
import { ProseStateProvider } from "@/components/playground-editor/ProseStateProvider";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

interface ComboBoxProps {
  windowSize: number[];
}

export default function ComboBox(props: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null); // Create a ref for the button
  const [buttonOffsetFromRight, setButtonOffsetFromRight] = useState(0); // State to hold the offset

  useEffect(() => {
    const updateButtonOffset = () => {
      if (buttonRef.current) {
        const padding = 8;
        const buttonWidth = buttonRef.current.offsetWidth;
        const buttonRight = buttonRef.current.getBoundingClientRect().right;
        const offset = window.innerWidth - buttonRight + buttonWidth - padding;
        setButtonOffsetFromRight(offset);
      }
    };

    // Call the function once when the component mounts
    updateButtonOffset();

    // Add event listener for window resize
    window.addEventListener("resize", updateButtonOffset);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", updateButtonOffset);
    };
  }, [buttonRef.current]); // Empty dependency array ensures the effect runs only on mount and unmount

  const threads = trpc.retrieveThreadList.retrieveThreadList.useQuery();
  if (!threads.data) return null;
  const empty = threads.data.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          className="h-[1.6rem] w-[1.6rem]"
        >
          <History className="h-[1.3rem] w-[1.3rem]" />
          {/* <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full"
        >
          {empty
            ? "No threads found"
            : value
            ? threads.data.find((thread) => thread.threadId === value)?.threadId
            : "Select thread..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          */}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0"
        side="left"
        align="start"
        sideOffset={props.windowSize[1] - buttonOffsetFromRight}
      >
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandEmpty>No thread found.</CommandEmpty>
          <CommandGroup>
            {threads.data.map((thread) => (
              <CommandItem
                key={thread.id}
                value={thread.threadId}
                onSelect={(currentValue) => {
                  console.log("currentValue", currentValue);
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                {thread.threadId}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === thread.threadId ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
