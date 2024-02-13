import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug",
)({
  component: WorkspaceComponent,
});

function WorkspaceComponent() {
  const { workspacesData } = Route.useRouteContext();

  return (
    <div>
      {JSON.stringify(workspacesData)}
      <h1>Workspace</h1>
    </div>
  );
}
