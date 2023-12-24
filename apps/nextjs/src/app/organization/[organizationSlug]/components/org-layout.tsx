"use client";

import CourseSelection from "./workspace-selection";
import { Icons } from "@acme/ui/components/bonus/icons";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@packages/ui/components/ui/button";
import ResizableWindows from "./resizable-windows";
import { useState, useEffect } from "react";
import { Nav } from "./main-nav-button";
import {
  Settings,
  Inbox,
  Calendar,
  Bot,
  MessageCircle,
  BellDot,
} from "lucide-react";

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

  const AIButton = () => {
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
    <div className="box-border flex h-screen flex-col overflow-hidden">
      <div className="flex-grow overflow-hidden">
        <div className="box-border grid w-full grid-cols-3 items-center py-3">
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
            <Nav
              links={[
                {
                  title: "Messages",
                  label: "",
                  icon: MessageCircle,
                  variant: "ghost",
                },
                {
                  title: "Direct Messages",
                  label: "",
                  icon: Inbox,
                  variant: "default",
                },
                {
                  title: "Calendar",
                  label: "",
                  icon: Calendar,
                  variant: "ghost",
                },

                {
                  title: "Notifications",
                  label: "",
                  icon: BellDot,
                  variant: "ghost",
                },
                {
                  title: "Settings",
                  label: "",
                  icon: Settings,
                  variant: "ghost",
                },
              ]}
            />
          </div>
          <div className="justify-self-end">
            <AIButton />
          </div>
        </div>
      </div>
      <ResizableWindows
        defaultLayout={defaultCollapsibleLayoutValues}
        isAICollapsed={isAICollapsed}
        setAICollapsed={setAICollapsed}
      >
        {children}
      </ResizableWindows>
    </div>
  );
}

export default OrgLayout;
