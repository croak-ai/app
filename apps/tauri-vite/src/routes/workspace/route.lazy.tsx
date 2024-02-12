import { trpc } from "@/utils/trpc";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/workspace")({
  component: WorkspaceComponent,
});

function WorkspaceComponent() {
  const { workspacesData } = Route.useLoaderData();

  return <div>{JSON.stringify(workspacesData)}</div>;
}
