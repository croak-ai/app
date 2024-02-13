import { trpc } from "@/utils/trpc";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_with-auth/_with-org/workspace")({
  component: () => <div>Hello /_with-auth/_with-org/workspace!</div>,
});

function WorkspaceComponent() {
  const { workspacesData } = Route.useLoaderData();

  const { data } =
    trpc.getWorkspaceMemberships.getWorkspaceMemberships.useQuery(undefined, {
      initialData: workspacesData,
    });

  return (
    <div>
      <h1>Workspace</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
