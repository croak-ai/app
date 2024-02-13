import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug",
)({
  parseParams: (params) => ({
    workspaceSlug: z.string().parse(params.workspaceSlug),
  }),
  loader: async ({ params: { workspaceSlug }, context }) => {
    const workspaceChannels =
      await context.apiUtils.getWorkspaceChannels.getWorkspaceChannels.ensureData(
        {
          zWorkspaceSlug: workspaceSlug,
        },
      );
    return {
      workspaceChannels,
    };
  },
});
