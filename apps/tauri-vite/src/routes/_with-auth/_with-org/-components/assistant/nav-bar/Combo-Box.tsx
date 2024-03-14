"use client";

import { CheckIcon } from "@radix-ui/react-icons";
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
  PopoverAnchor,
} from "@acme/ui/components/ui/popover";
import { trpc } from "@/utils/trpc";
import { useState } from "react";

export default function ComboBox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const threads = trpc.retrieveThreadList.retrieveThreadList.useQuery();
  if (!threads.data) return null;
  const empty = threads.data.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor className="absolute -bottom-1 -left-1" />
      <PopoverTrigger>
        <Button variant="ghost" size="icon" className="h-[1.6rem] w-[1.6rem]">
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
      <PopoverContent className="p-0" side="left" align="start">
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
