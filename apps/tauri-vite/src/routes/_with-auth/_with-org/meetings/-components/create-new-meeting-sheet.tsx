import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@acme/ui/components/ui/sheet";
import { Plus } from "lucide-react";

import { Button } from "@acme/ui/components/ui/button";
import CreateMeetingForm from "./create-new-meeting-form";

export const CreateNewMeetingSheetButton = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" /> Create New Meeting
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <CreateMeetingForm />
      </SheetContent>
    </Sheet>
  );
};

export default CreateNewMeetingSheetButton;
