import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/workspace")({
  loader: async ({ context }) => {
    // We will ensure the data using the apiUtils and
    // return it to the loader if it exists in cache, to be used as initialData
    const workspacesData =
      await context.apiUtils.getAvailableGroups.getAvailableGroups.ensureData();
    return {
      workspacesData,
    };
  },
});
