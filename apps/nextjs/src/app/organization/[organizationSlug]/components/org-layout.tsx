"use client";

import CourseSelection from "./workspace-selection";
import { Icons } from "@acme/ui/components/bonus/icons";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@packages/ui/components/ui/button";
import ResizableWindows from "./resizable-windows";
import { useState, useEffect } from "react";

export function OrgLayout({
  children,
  defaultCollapsibleLayoutValues,
  defaultCollapsibleIsAICollapsed,
}: {
  children: React.ReactNode;
  defaultCollapsibleLayoutValues: number[];
  defaultCollapsibleIsAICollapsed: boolean;
}) {
  const [isAICollapsed, setAICollapsed] = useState(
    defaultCollapsibleIsAICollapsed,
  );
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(window.navigator.userAgent.includes("Mac"));
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAICollapsed((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const AISheet = () => {
    return (
      <>
        {isAICollapsed && (
          <Button variant="outline" onClick={() => setAICollapsed(false)}>
            Ask Voyaging AI <Icons.magicWand className="mx-2 h-4 w-4" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-base">{isMac ? "⌘ J" : "Ctrl + J"}</span>
            </kbd>
          </Button>
        )}
      </>
    );
  };

  return (
    <>
      <div className="grid w-full grid-cols-3 items-center py-3">
        <span className="flex px-6">
          <div className="mt-2">
            <OrganizationSwitcher
              afterSelectOrganizationUrl={`/organization/:slug`}
            />
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
      <ResizableWindows
        defaultLayout={defaultCollapsibleLayoutValues}
        isAICollapsed={isAICollapsed}
        setAICollapsed={setAICollapsed}
      >
        {children}
      </ResizableWindows>
    </>
  );
}

export default OrgLayout;
