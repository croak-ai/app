"use client";

import { Button } from "@acme/ui/components/ui/button";
import { Hash, Mic2 } from "lucide-react";
import { zChannelTypes } from "@acme/db/enum";
import { ScrollArea } from "@acme/ui/components/ui/scroll-area";
import { Link, useParams } from "@tanstack/react-router";

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

export default function ChannelList({
  workspaceChannels,
}: {
  workspaceChannels: { slug: string; channelType: string }[];
}) {
  const params = useParams({ strict: false }) as {
    workspaceSlug: string;
    channelSlug?: string;
  };

  return (
    <ScrollArea className=" flex flex-col gap-2 p-4">
      <main className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-medium">Channels</h2>
        {workspaceChannels.map((channel) => (
          <div key={channel.slug}>
            <Link
              to={`/workspace/$workspaceSlug/channel/$channelSlug`}
              params={{
                channelSlug: channel.slug,
                workspaceSlug: params.workspaceSlug,
              }}
            >
              <Button
                className="flex h-8 w-full justify-start p-1"
                variant={
                  params.channelSlug === channel.slug ? "secondary" : "ghost"
                }
              >
                <ChannelIcon channelType={channel.channelType} />
                {channel.slug}
              </Button>
            </Link>
          </div>
        ))}
      </main>
    </ScrollArea>
  );
}
