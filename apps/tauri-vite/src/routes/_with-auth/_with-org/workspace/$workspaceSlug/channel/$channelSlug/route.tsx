import { createFileRoute } from "@tanstack/react-router";
import ChatBoxProvider from "./-components/chat-box-provider";
import ChatBox from "./-components/chat-box";

export const Route = createFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug/channel/$channelSlug",
)({
  component: Channel,
});

function Channel() {
  const { workspaceSlug, channelSlug } = Route.useParams();
  return (
    <ChatBoxProvider>
      <ChatBox workspaceSlug={workspaceSlug} channelSlug={channelSlug} />
    </ChatBoxProvider>
  );
}
