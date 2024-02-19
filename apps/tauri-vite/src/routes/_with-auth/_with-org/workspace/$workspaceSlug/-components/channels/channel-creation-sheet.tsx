import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from "@acme/ui/components/ui/sheet";
import CreateChannelForm from "./create-channel-form";

export const ChannelCreationSheet = ({
  channelSheetOpen,
  setChannelSheetOpen,
  takenChannelNames,
}: {
  channelSheetOpen: boolean;
  setChannelSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  takenChannelNames?: string[];
}) => {
  return (
    <Sheet
      modal={true}
      open={channelSheetOpen}
      onOpenChange={setChannelSheetOpen}
    >
      <SheetContent side="left">
        <SheetHeader className="pb-2">
          <SheetTitle
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            Create Channel
          </SheetTitle>
        </SheetHeader>
        <CreateChannelForm
          takenChannelNames={takenChannelNames}
          onClose={() => setChannelSheetOpen(false)}
        />
        <SheetFooter>
          <SheetClose asChild></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
