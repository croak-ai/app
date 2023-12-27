"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ImperativeResizablePanel,
} from "@packages/ui/components/ui/resizable";
import React, { useRef, useEffect } from "react";
import { cn } from "@acme/ui/lib/utils";

interface MailProps {
  defaultLayout: number[];
  isAICollapsed: boolean;
  setAICollapsed: (collapsed: boolean) => void;
  children: React.ReactNode;
}

const ResizableWindows: React.FC<MailProps> = ({
  defaultLayout,

  isAICollapsed,
  setAICollapsed,
  children,
}) => {
  const aiPanelRef = useRef<ImperativeResizablePanel>(null);

  useEffect(() => {
    if (aiPanelRef.current) {
      isAICollapsed
        ? aiPanelRef.current.collapse()
        : aiPanelRef.current.expand();
    }
    document.cookie = `react-resizable-panels:collapsed=${isAICollapsed}`;
  }, [isAICollapsed]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
          sizes,
        )}`;
      }}
    >
      <ResizablePanel defaultSize={defaultLayout[0]}>{children}</ResizablePanel>
      <ResizableHandle withHandle={!isAICollapsed} withBorder={false} />
      <ResizablePanel
        collapsible={true}
        defaultSize={defaultLayout[1]}
        minSize={15}
        maxSize={30}
        onCollapse={() => {
          setAICollapsed(true);
        }}
        onExpand={() => {
          setAICollapsed(false);
        }}
        className={cn(
          isAICollapsed && "transition-all duration-300 ease-in-out",
        )}
        ref={aiPanelRef}
      >
        <span className="font-semibold">Two</span>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ResizableWindows;
