import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug/",
)({
  component: WorkspaceSlugIndex,
});

function WorkspaceSlugIndex() {
  const { workspacesChannelsInitialData } = Route.useRouteContext();
  const { workspaceSlug } = Route.useParams();

  if (workspacesChannelsInitialData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-4xl font-bold">
        Right-click in the sidebar to create your first channel! 📁
      </div>
    );
  }

  // Assuming the intention is to navigate to a default or first channel if it exists
  const firstChannelId = workspacesChannelsInitialData[0].id;
  return (
    <Navigate
      to={`/workspace/$workspaceSlug/channel/$channelId`}
      params={{
        channelId: firstChannelId.toString(),
        workspaceSlug: workspaceSlug,
      }}
    />
  );
}
