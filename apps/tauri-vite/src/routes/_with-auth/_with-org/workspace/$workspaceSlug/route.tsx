import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug",
)({
  beforeLoad: async ({ context, params }) => {
    const workspacesChannelsInitialData =
      await context.apiUtils.getWorkspaceChannels.getWorkspaceChannels.ensureData(
        { zWorkspaceSlug: params.workspaceSlug },
      );

    return { workspacesChannelsInitialData };
  },
});
