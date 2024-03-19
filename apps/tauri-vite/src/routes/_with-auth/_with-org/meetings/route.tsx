import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/meetings")({
  beforeLoad: async ({ context }) => {
    const meetingsInitialData =
      await context.apiUtils.getUserMeetings.getUserMeetings.ensureData();
    return { meetingsInitialData };
  },
});
