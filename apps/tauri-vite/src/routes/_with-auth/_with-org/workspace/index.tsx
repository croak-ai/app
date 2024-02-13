import { Navigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/workspace/")({
  component: WorkspaceIndexRoute,
});

function WorkspaceIndexRoute() {
  const { workspacesData } = Route.useRouteContext();

  if (workspacesData.length === 0) {
    return <Navigate to="/workspace/create" />;
  }

  return (
    <Navigate
      to={`/workspace/$workspaceSlug`}
      params={{ workspaceSlug: workspacesData[0].workspace.slug }}
    />
  );
}
