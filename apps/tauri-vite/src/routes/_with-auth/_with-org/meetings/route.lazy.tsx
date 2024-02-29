import { Outlet, createLazyFileRoute } from "@tanstack/react-router";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@acme/ui/components/ui/resizable";
import CreateNewMeetingSheetButton from "./-components/create-new-meeting-sheet";

export const Route = createLazyFileRoute("/_with-auth/_with-org/meetings")({
  component: MeetingsLayout,
});

function MeetingsLayout() {
  const meetingsLayoutValues = localStorage.getItem(
    "meetings-resizable-panels:layout",
  );
  const defaultMeetingsLayoutValues: number[] = meetingsLayoutValues
    ? JSON.parse(meetingsLayoutValues)
    : [20, 80];

  return (
    <div className="h-full w-full rounded-xl border bg-card text-card-foreground shadow">
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          localStorage.setItem(
            "meetings-resizable-panels:layout",
            JSON.stringify(sizes),
          );
        }}
      >
        <ResizablePanel
          defaultSize={defaultMeetingsLayoutValues[0]}
          maxSize={25}
          minSize={15}
        >
          <div className="flex w-full flex-col items-end p-2">
            <CreateNewMeetingSheetButton />
          </div>
          <div className="flex h-full w-full flex-col ">Channels...</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={defaultMeetingsLayoutValues[1]}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
