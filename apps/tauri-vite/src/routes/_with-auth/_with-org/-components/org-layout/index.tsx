import { Icons } from "@acme/ui/components/bonus/icons";
import { OrganizationSwitcher, UserButton, useAuth } from "@clerk/clerk-react";
import { Button } from "@acme/ui/components/ui/button";
import ResizableWindows from "./resizable-windows";
import { useState, useEffect } from "react";
import { Nav } from "./main-nav-button";
import { Inbox, TextQuote, BellDot } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { dark } from "@clerk/themes";
import { useTheme } from "@/theme";

export function OrgLayout({ children }: { children: React.ReactNode }) {
  const collapsibleLayoutValues = localStorage.getItem(
    "org-resizable-panels:layout",
  );
  const collapsibleIsAICollapsed = localStorage.getItem(
    "org-resizable-panels:collapsed",
  );

  const defaultCollapsibleLayoutValues: number[] = collapsibleLayoutValues
    ? JSON.parse(collapsibleLayoutValues)
    : [70, 30];

  const defaultCollapsibleIsAICollapsed: boolean =
    collapsibleIsAICollapsed && collapsibleIsAICollapsed !== "undefined"
      ? JSON.parse(collapsibleIsAICollapsed) === "true"
      : true;

  const [isAICollapsed, setAICollapsed] = useState(
    defaultCollapsibleIsAICollapsed,
  );
  const [isMac, setIsMac] = useState(false);

  const { theme } = useTheme();

  const { orgSlug } = useAuth();

  if (!orgSlug) {
    return <>TEST</>;
  }

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
            Ask Croak AI <Icons.magicWand className="mx-2 h-4 w-4" />
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
              <UserButton />
            </div>
            <Icons.slash
              style={{ width: "50px", height: "50px" }}
              className="bg-text"
            />
            <div className="mt-2">
              <OrganizationSwitcher
                afterSelectOrganizationUrl={`/workspace`}
                hidePersonal={true}
                appearance={theme === "dark" ? (dark as any) : undefined}
              />
            </div>
          </span>
          <div className="flex space-x-4 justify-self-center">
            <Nav title="Workspace" to={`/workspace`} icon={TextQuote} />
            <Nav title="Inbox" to={`/create-workspace`} icon={Inbox} />
            <Nav
              title="Notifications"
              to={`/create-workspace`}
              icon={BellDot}
            />
            <ThemeToggle />
          </div>
          <div className="mx-4 justify-self-end">
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
