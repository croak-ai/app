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

interface ThreadSelectionProps {
  threadId: string;
  setThreadId: (thread: string) => void;
}

export default function ThreadSelection(Props: ThreadSelectionProps) {
  const [open, setOpen] = useState(false);
  const threads = trpc.retrieveThreadList.retrieveThreadList.useQuery();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor className="absolute -bottom-1 -left-1" />
      <PopoverTrigger className="mx-0.5 h-[1.4rem] w-[1.4rem]" asChild>
        <Button variant="ghost" size="icon" className="h-[1.4rem] w-[1.4rem]">
          <History className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" side="left" align="start">
        <Command>
          <CommandInput placeholder="Search threads..." className="h-9" />
          <CommandEmpty>No threads found.</CommandEmpty>
          <CommandGroup>
            {threads.data?.map((thread) => (
              <CommandItem
                key={thread.id}
                value={thread.threadId}
                onSelect={() => {
                  if (thread.threadId !== Props.threadId) {
                    Props.setThreadId(thread.threadId);
                    localStorage.setItem("threadId", thread.threadId);
                    setOpen(false);
                  }
                  setOpen(false);
                }}
              >
                <p className="max-w-[21rem] truncate">{thread.preview}</p>

                {Props.threadId === thread.threadId && (
                  <CheckIcon className={cn("ml-auto h-4 w-4")} />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
