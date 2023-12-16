"use client";

import * as React from "react";
import { Button } from "@acme/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
  SheetTrigger,
} from "@acme/ui/components/ui/sheet";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export const WorkspaceCreationSheet = () => {
  const [showNewWorkspaceSheet, setShowNewWorkspaceSheet] =
    React.useState(false);

  const toggleSheet = () => {
    setShowNewWorkspaceSheet(!showNewWorkspaceSheet);
  };

  return (
    <Sheet open={showNewWorkspaceSheet} onOpenChange={setShowNewWorkspaceSheet}>
      <SheetTrigger asChild onClick={toggleSheet}>
        <Button variant="outline" className="w-full rounded-none border-none">
          {" "}
          <PlusCircledIcon className="mr-2 h-5 w-5" />
          Create Workspace
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="pb-2">
          <SheetTitle
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            Create Workspace
          </SheetTitle>
        </SheetHeader>
        <div
          className="scrollable-content pb-4 pt-4"
          style={{
            maxHeight: "calc(100vh - 6rem)",
            overflowY: "auto",
            paddingRight: "15px",
            boxSizing: "content-box",
            width: "calc(100% - 15px)",
          }}
        >
          {/* Add an empty space div */}
          <div style={{ height: "200px" }}></div>
        </div>

        <SheetFooter>
          <SheetClose asChild></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
