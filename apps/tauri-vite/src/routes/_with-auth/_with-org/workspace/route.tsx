import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/workspace")({
  beforeLoad: async ({ context }) => {
    const workspacesInitialData =
      await context.apiUtils.getWorkspaceMemberships.getWorkspaceMemberships.ensureData();

    return { workspacesInitialData };
  },
  component: WorkspaceComponent,
  // Do not cache this route's data after it's unloaded
  gcTime: 0,
  // Only reload the route when the user navigates to it or when deps change
  shouldReload: false,
});

function WorkspaceComponent() {
  return <Outlet />;
}
