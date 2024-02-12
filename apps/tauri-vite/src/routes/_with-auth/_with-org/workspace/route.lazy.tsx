import { trpc } from "@/utils/trpc";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_with-auth/_with-org/workspace")({
  component: WorkspaceComponent,
});

function WorkspaceComponent() {
  const { workspacesData } = Route.useLoaderData();

  return <div>{JSON.stringify(workspacesData)}</div>;
}
