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

import { Button } from "@acme/ui/components/ui/button";

export const CreateNewMeetingSheet = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Button>Create New Meeting</Button>
      </SheetTrigger>
      <SheetContent side={"left"}>sadf</SheetContent>
    </Sheet>
  );
};

export default CreateNewMeetingSheet;
