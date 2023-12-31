"use client";

import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@acme/ui/components/ui/avatar";
import Link from "next/link";
import { Card } from "@acme/ui/components/ui/card";
import WorkspaceSelection from "./workspace-selection";
import { WorkspaceRightClickMenu } from "./workspace-right-click";
import { useState } from "react";
import { ChannelCreationSheet } from "./channels/channel-creation-sheet";

export default function WorkspaceSidebar() {
  const [channelSheetOpen, setChannelSheetOpen] = useState(false);

  return (
    <WorkspaceRightClickMenu
      onChannelSheetOpen={() => setChannelSheetOpen(true)}
    >
      <ChannelCreationSheet
        channelSheetOpen={channelSheetOpen}
        setChannelSheetOpen={setChannelSheetOpen}
      />
      <div className="flex h-full w-full flex-col ">
        <header className="flex h-16 items-center border-b px-4">
          <WorkspaceSelection />
        </header>
        <main className="flex flex-col gap-2 p-4">
          <h2 className="text-lg font-medium">Channels</h2>
          {/* <Card className="p-2">
            <Link className="flex items-center gap-2 text-sm" href="#">
              <span>General</span>
            </Link>
          </Card>
          <Card className="p-2">
            <Link className="flex items-center gap-2 text-sm" href="#">
              <span>Random</span>
            </Link>
          </Card> */}
        </main>
      </div>
    </WorkspaceRightClickMenu>
  );
}
