import { apiUtils } from "@/utils/trpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace")({
  loader: async () => {
    // We will ensure the data using the apiUtils and
    // return it to the loader if it exists in cache, to be used as initialData
    const workspaceData =
      await apiUtils.getAvailableGroups.getAvailableGroups.ensureData();

    console.log(JSON.stringify(workspaceData));
    return {
      workspaceData,
    };
  },
});
