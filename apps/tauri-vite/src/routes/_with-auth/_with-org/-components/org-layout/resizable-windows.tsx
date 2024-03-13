import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ImperativeResizablePanel,
} from "@acme/ui/components/ui/resizable";
import React, { useRef, useEffect } from "react";
import { cn } from "@acme/ui/lib/utils";
import Assistant from "../assistant";

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
  const [windowSize, setWindowSize] = React.useState<number[]>(defaultLayout);

  useEffect(() => {
    if (aiPanelRef.current) {
      isAICollapsed
        ? aiPanelRef.current.collapse()
        : aiPanelRef.current.expand();
    }
    localStorage.setItem(
      "org-resizable-panels:collapsed",
      JSON.stringify(isAICollapsed),
    );
  }, [isAICollapsed]);

  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;
  console.log("Containerwidth: ", containerWidth);
  console.log("Windowsize: ", windowSize);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        localStorage.setItem(
          "org-resizable-panels:layout",
          JSON.stringify(sizes),
        );
        setWindowSize([
          (sizes[0] / 100) * containerHeight,
          (sizes[1] / 100) * containerWidth,
        ]);
        console.log(sizes);
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
        <Assistant windowSize={windowSize} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ResizableWindows;
