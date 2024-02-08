"use client";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@acme/ui/components/ui/context-menu";
import { ChannelCreationSheet } from "./channels/channel-creation-sheet";
import { useState } from "react";

export function WorkspaceRightClickMenu({
  children,
  onChannelSheetOpen,
}: {
  children: React.ReactNode;
  onChannelSheetOpen?: () => void;
}) {
  const [channelSheetOpen, setChannelSheetOpen] = useState(false);
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset onClick={onChannelSheetOpen}>
          Create New Channel
        </ContextMenuItem>
        <ChannelCreationSheet
          channelSheetOpen={channelSheetOpen}
          setChannelSheetOpen={setChannelSheetOpen}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}
