import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ImperativeResizablePanel,
} from "@acme/ui/components/ui/resizable";
import React, { useRef, useEffect } from "react";
import { cn } from "@acme/ui/lib/utils";
import ChatBot from "./chat-bot";

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
    localStorage.setItem(
      "react-resizable-panels:collapsed",
      JSON.stringify(isAICollapsed),
    );
  }, [isAICollapsed]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        localStorage.setItem(
          "react-resizable-panels:layout",
          JSON.stringify(sizes),
        );
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
        <ChatBot />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ResizableWindows;
