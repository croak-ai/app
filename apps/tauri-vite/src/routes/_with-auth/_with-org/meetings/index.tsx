import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_with-auth/_with-org/meetings/")({
  component: MeetingsIndex,
});

function MeetingsIndex() {
  const { meetingsInitialData } = Route.useRouteContext();

  if (meetingsInitialData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-4xl font-bold">
        No meetings found! Create your first meeting.
      </div>
    );
  }

  const firstMeetingId = meetingsInitialData[0].meeting.id;
  return (
    <Navigate
      to={`/meetings/$meetingId`}
      params={{
        meetingId: firstMeetingId.toString(),
      }}
    />
  );
}
