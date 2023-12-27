"use client";

import { Suspense } from "react";
import WorkspaceSidebar from "./components/workspace-sidebar";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@acme/ui/components/ui/resizable";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full rounded-xl border bg-card text-card-foreground shadow">
      <Suspense fallback={<>SUSPENSE3</>}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} maxSize={25} minSize={15}>
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </Suspense>
    </div>
  );
}
