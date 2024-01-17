"use client";

import ChannelList from "./channels/channel-list";
import WorkspaceSelection from "./workspace-selection";
import { WorkspaceRightClickMenu } from "./workspace-right-click";
import { useState } from "react";
import { ChannelCreationSheet } from "./channels/channel-creation-sheet";
import { reactTRPC } from "@/utils/trpc/reactTRPCClient";
import { useParams } from "next/navigation";
import { ChannelSkeleton } from "./channels/channel-list-skeleton";
import Link from "next/link";
import { Button } from "@acme/ui/components/ui/Button";
import { Hash, Mic2 } from "lucide-react";
import { zChannelTypes } from "@acme/db/enum";

export default function WorkspaceSidebar() {
  const [channelSheetOpen, setChannelSheetOpen] = useState(false);

  const params = useParams<{
    workspaceSlug: string;
  }>();

  if (!params?.workspaceSlug) {
    return <></>;
  }

  const workspaceChannels =
    reactTRPC.getWorkspaceChannels.getWorkspaceChannels.useQuery({
      zWorkspaceSlug: params.workspaceSlug,
    });

  const Channels = () => {
    if (workspaceChannels.isLoading || !workspaceChannels.data) {
      return <ChannelSkeleton />;
    }

    return (
      <ChannelList
        workspaceChannels={workspaceChannels.data.map((channel) => ({
          id: String(channel.id),
          name: channel.name,
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
          (channel) => channel.name,
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
