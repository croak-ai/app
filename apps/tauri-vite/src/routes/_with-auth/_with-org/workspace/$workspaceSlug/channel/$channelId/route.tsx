import { createFileRoute } from "@tanstack/react-router";
import ChatBoxProvider from "./-components/chat-box-provider";
import ChatBox from "./-components/chat-box";

export const Route = createFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug/channel/$channelId",
)({
  component: Channel,
});

function Channel() {
  const { workspaceSlug, channelId } = Route.useParams();
  return (
    <ChatBoxProvider>
      <ChatBox workspaceSlug={workspaceSlug} channelId={channelId} />
    </ChatBoxProvider>
  );
}
