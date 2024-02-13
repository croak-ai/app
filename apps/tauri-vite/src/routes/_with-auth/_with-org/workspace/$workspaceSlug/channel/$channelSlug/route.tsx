import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug/channel/$channelSlug",
)({
  component: () => (
    <div>
      Hello /_with-auth/_with-org/workspace/$workspaceSlug/channel/$channelSlug!
    </div>
  ),
});
