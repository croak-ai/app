import { Sheet, SheetContent } from "@acme/ui/components/ui/sheet";
import { Plus } from "lucide-react";

import { Button } from "@acme/ui/components/ui/button";
import CreateMeetingForm from "./create-new-meeting-form";
import { useState } from "react";
import { ScrollArea } from "@acme/ui/components/ui/scroll-area";

export const CreateNewMeetingSheetButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant={"outline"} size={"sm"} onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Create New Meeting
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side={"left"}>
          <ScrollArea className="h-screen pb-4 pr-4">
            <CreateMeetingForm onCreated={() => setIsOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CreateNewMeetingSheetButton;
