import { Outlet, createLazyFileRoute } from "@tanstack/react-router";
import WorkspaceSidebar from "./-components/workspace-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@acme/ui/components/ui/resizable";

export const Route = createLazyFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug",
)({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const workspaceLayoutValues = localStorage.getItem(
    "workspace-resizable-panels:layout",
  );
  const defaultWorkspaceLayoutValues: number[] = workspaceLayoutValues
    ? JSON.parse(workspaceLayoutValues)
    : [20, 80];

  return (
    <div className="h-full w-full rounded-xl border bg-card text-card-foreground shadow">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          localStorage.setItem(
            "workspace-resizable-panels:layout",
            JSON.stringify(sizes),
          );
        }}
      >
        <ResizablePanel
          defaultSize={defaultWorkspaceLayoutValues[0]}
          maxSize={25}
          minSize={15}
        >
          <WorkspaceSidebar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={defaultWorkspaceLayoutValues[1]}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
