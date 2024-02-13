import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/workspace")({
  beforeLoad: async ({ context }) => {
    const workspacesData =
      await context.apiUtils.getWorkspaceMemberships.getWorkspaceMemberships.ensureData();

    return { workspacesData };
  },
  component: WorkspaceComponent,
});

function WorkspaceComponent() {
  return <Outlet />;
}
