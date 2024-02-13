import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/workspace")({
  loader: async ({ context }) => {
    const workspacesData =
      await context.apiUtils.getWorkspaceMemberships.getWorkspaceMemberships.ensureData();

    return {
      workspacesData,
    };
  },
});
