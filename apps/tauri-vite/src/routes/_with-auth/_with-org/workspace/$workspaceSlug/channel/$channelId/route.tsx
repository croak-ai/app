import { createFileRoute } from "@tanstack/react-router";
import ChatBoxProvider from "./-components/chat-box-provider";
import ChatBox from "./-components/chat-box";
import { RouterInput } from "@/utils/trpc";
import Spinner from "@/components/Spinner";

type Cursor = RouterInput["getMessages"]["getMessages"]["cursor"];

export const Route = createFileRoute(
  "/_with-auth/_with-org/workspace/$workspaceSlug/channel/$channelId",
)({
  component: Channel,
  loader: async ({ context, params }) => {
    const newestMessage =
      await context.apiUtils.getNewestMessage.getNewestMessage.ensureData({
        channelId: params.channelId,
      });
    return {
      newestMessage,
    };
  },
});

function Channel() {
  const { workspaceSlug, channelId } = Route.useParams();
  const { newestMessage } = Route.useLoaderData();

  if (!newestMessage) {
    return <Spinner />;
  }

  const initialCursor: Cursor = {
    id: newestMessage.message.message.id.toString(),
    createdAt: newestMessage.message.message.createdAt,
    direction: "next",
    includeCursorInResult: true,
  };

  return (
    <ChatBoxProvider>
      <ChatBox
        workspaceSlug={workspaceSlug}
        channelId={channelId}
        initialCursor={initialCursor}
      />
    </ChatBoxProvider>
  );
}
