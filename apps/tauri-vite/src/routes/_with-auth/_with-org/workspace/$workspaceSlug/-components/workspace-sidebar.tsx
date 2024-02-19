import ChannelList from "./channels/channel-list";
import WorkspaceSelection from "./workspace-selection";
import { WorkspaceRightClickMenu } from "./workspace-right-click";
import { useState } from "react";
import { ChannelCreationSheet } from "./channels/channel-creation-sheet";
import { trpc } from "@/utils/trpc";
import { ChannelSkeleton } from "./channels/channel-list-skeleton";
import { useParams } from "@tanstack/react-router";

export default function WorkspaceSidebar() {
  const [channelSheetOpen, setChannelSheetOpen] = useState(false);
  const { workspaceSlug } = useParams({ strict: false }) as {
    workspaceSlug: string;
  };

  const workspaceChannels =
    trpc.getWorkspaceChannels.getWorkspaceChannels.useQuery({
      zWorkspaceSlug: workspaceSlug,
    });

  const Channels = () => {
    if (workspaceChannels.isLoading || !workspaceChannels.data) {
      return <ChannelSkeleton />;
    }

    return (
      <ChannelList
        workspaceChannels={workspaceChannels.data.map((channel) => ({
          slug: channel.slug,
          channelType: channel.channelType,
        }))}
      />
    );
  };

  return (
    <WorkspaceRightClickMenu
      onChannelSheetOpen={() => setChannelSheetOpen(true)}
    >
      <ChannelCreationSheet
        channelSheetOpen={channelSheetOpen}
        setChannelSheetOpen={setChannelSheetOpen}
        takenChannelNames={workspaceChannels.data?.map(
          (channel) => channel.slug,
        )}
      />
      <div className="flex h-full w-full flex-col ">
        <header className="flex h-16 items-center border-b px-4">
          <WorkspaceSelection />
        </header>
        <Channels />
      </div>
    </WorkspaceRightClickMenu>
  );
}
