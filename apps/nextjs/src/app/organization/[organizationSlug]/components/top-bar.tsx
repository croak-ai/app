"use client";

import { useState, Suspense, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@packages/ui/components/ui/sheet";

import CourseSelection from "../components/workspace-selection";
import { Icons } from "@acme/ui/components/bonus/icons";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@packages/ui/components/ui/button";

export function OrgLayout({ children }: { children: React.ReactNode }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(window.navigator.userAgent.includes("Mac"));
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSheetOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const AISheet = () => {
    return (
      <>
        {isSheetOpen ? null : (
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            Ask Voyaging AI <Icons.magicWand className="mx-2 h-4 w-4" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-base">{isMac ? "⌘ J" : "Ctrl + J"}</span>
            </kbd>
          </Button>
        )}
        <Sheet modal={false} open={isSheetOpen}>
          <SheetContent className="w-[600px]" side="rightNoBlur">
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center justify-between">
                  Chat With AI
                  <div>
                    <div className="justify-self-end">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-base">
                          {isMac ? "⌘ J" : "Ctrl + J"}
                        </span>
                      </kbd>
                      <Button
                        variant="ghost"
                        onClick={() => setSheetOpen(false)}
                        className="ml-2"
                      >
                        X
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetTitle>
              <SheetDescription>Loreum Ipsum</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">adsasddasdsaasd</div>
          </SheetContent>
        </Sheet>
      </>
    );
  };

  return (
    <>
      <div className="grid w-full grid-cols-3 items-center py-3">
        <span className="flex px-6">
          <div className="mt-2">
            <OrganizationSwitcher />
          </div>

          <div>
            <CourseSelection />
          </div>
        </span>
        <div className="justify-self-center">
          <Button className="w-72 ">
            Notifications
            <span className="ml-2">
              <Icons.bell className="h-4 w-4" />
            </span>
          </Button>
        </div>
        <div className="mr-12 justify-self-end">
          <AISheet />
        </div>
      </div>
      <div
        className={`main-content ${
          isSheetOpen ? "mr-[600px]" : "mr-0"
        } transition-margin duration-500`}
      >
        {children}
      </div>
    </>
  );
}

export default OrgLayout;
