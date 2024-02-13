import { trpc } from "@/utils/trpc";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug",
)({
  component: WorkspaceComponent,
});

function WorkspaceComponent() {
  const { workspacesData } = Route.useRouteContext();

  const { data } =
    trpc.getWorkspaceMemberships.getWorkspaceMemberships.useQuery(undefined, {
      initialData: workspacesData,
    });

  return (
    <div>
      {JSON.stringify(data)}
      <h1>Workspace</h1>
    </div>
  );
}
