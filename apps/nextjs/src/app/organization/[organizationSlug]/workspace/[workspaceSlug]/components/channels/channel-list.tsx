"use client";

import { WorkspaceRightClickMenu } from "../workspace-right-click";
import { useState } from "react";
import { ChannelCreationSheet } from "./channel-creation-sheet";
import { reactTRPC } from "@next/utils/trpc/reactTRPCClient";
import { useParams } from "next/navigation";
import { ChannelSkeleton } from "./channel-list-skeleton";
import Link from "next/link";
import { Button } from "@next/components/ui/Button";
import { Hash, Mic2 } from "lucide-react";
import { zChannelTypes } from "@packages/db/enum";

const ChannelIcon = ({ channelType }: { channelType: string }) => {
  switch (channelType) {
    case zChannelTypes.enum.text:
      return <Hash className="mx-2 h-4 w-4" />;
    case zChannelTypes.enum.voice:
      return <Mic2 className="mx-2 h-4 w-4" />;
    default:
      return <></>;
  }
};

export default function ChannelList() {
  const [channelSheetOpen, setChannelSheetOpen] = useState(false);

  const params = useParams<{
    workspaceSlug: string;
    organizationSlug: string;
    channelId: string;
  }>();

  if (!params?.workspaceSlug || !params?.organizationSlug) {
    return <ChannelSkeleton />;
  }

  const workspaceChannels =
    reactTRPC.getWorkspaceChannels.getWorkspaceChannels.useQuery({
      zWorkspaceSlug: params.workspaceSlug,
    });

  if (workspaceChannels.isLoading) {
    return <ChannelSkeleton />;
  }

  return (
    <WorkspaceRightClickMenu
      onChannelSheetOpen={() => setChannelSheetOpen(true)}
    >
      <ChannelCreationSheet
        channelSheetOpen={channelSheetOpen}
        setChannelSheetOpen={setChannelSheetOpen}
      />

      <main className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-medium">Channels</h2>
        {workspaceChannels.data?.map((channel) => (
          <div key={channel.id.toString()}>
            <Link
              href={`/organization/${params.organizationSlug}/workspace/${params.workspaceSlug}/channel/${channel.id}/${channel.channelType}`}
            >
              <Button
                className="w-full p-2"
                variant={
                  params.channelId === channel.id.toString()
                    ? "secondary"
                    : "ghost"
                }
              >
                <ChannelIcon channelType={channel.channelType} />
                {channel.name}
              </Button>
            </Link>
          </div>
        ))}
      </main>
    </WorkspaceRightClickMenu>
  );
}
