import ChannelList from "./channels/channel-list";
import WorkspaceSelection from "./workspace-selection";

export default function WorkspaceSidebar() {
  return (
    <div className="flex h-full w-full flex-col ">
      <header className="flex h-16 items-center border-b px-4">
        <WorkspaceSelection />
      </header>
      <ChannelList />
    </div>
  );
}
