import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/workspace")({
  component: WorkspaceComponent,
});

function WorkspaceComponent() {
  const workspaceData = Route.useLoaderData();

  return <div>{JSON.stringify(workspaceData)}</div>;
}
