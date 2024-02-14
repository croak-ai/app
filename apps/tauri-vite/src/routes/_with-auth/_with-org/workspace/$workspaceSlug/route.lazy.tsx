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
  return (
    <div className="h-full w-full rounded-xl border bg-card text-card-foreground shadow">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} maxSize={25} minSize={15}>
          <WorkspaceSidebar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
