import { useState } from "react";
import { trpc } from "@/utils/trpc";

export default function MeetingList() {
  const [meetingSheetOpen, setMeetingSheetOpen] = useState(false);

  const utils = trpc.useUtils();

  const userMeetings = trpc.getUserMeetings.getUserMeetings.useQuery();

  const Meetings = () => {
    if (userMeetings.isLoading || !userMeetings.data) {
      return <div></div>;
    }

    if (userMeetings.data.length === 0) {
      return <div className="mx-auto mt-4">You aren't in any meetings.</div>;
    }

    return (
      <div className="flex flex-col">
        {userMeetings.data.map((data) => (
          <div key={data.meeting.id} className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold">{data.meeting.name}</h3>
            <p className="text-sm text-gray-600">{data.meeting.description}</p>
            <p className="text-sm text-gray-600">
              Scheduled:{" "}
              {new Date(data.meeting.scheduledStart).toLocaleString()} -{" "}
              {new Date(data.meeting.scheduledEnd).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col ">
      <Meetings />
    </div>
  );
}
