import { trpc } from "@/utils/trpc";
import { Link, useParams } from "@tanstack/react-router";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { ScrollArea } from "@acme/ui/components/ui/scroll-area";
import { Badge } from "@acme/ui/components/ui/badge";
import { Crown } from "lucide-react";
import { RouterOutput } from "@/utils/trpc";

type UserMeetings = RouterOutput["getUserMeetings"]["getUserMeetings"];

export default function MeetingList({
  initialData,
}: {
  initialData?: UserMeetings;
}) {
  const { meetingId } = useParams({ strict: false }) as {
    meetingId: string;
  };

  const userMeetings = trpc.getUserMeetings.getUserMeetings.useQuery(
    undefined,
    { initialData },
  );

  const MeetingItems = () => {
    if (userMeetings.isLoading || !userMeetings.data) {
      return <div>Loading...</div>;
    }

    if (userMeetings.data.length === 0) {
      return <div className="mx-auto mt-4">You aren't in any meetings.</div>;
    }

    return (
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {userMeetings.data.map((meeting) => (
            <Link
              to={`/meetings/$meetingId`}
              params={{ meetingId: meeting.meeting.id }}
              key={meeting.meeting.id}
              className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${
                meetingId === meeting.meeting.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{meeting.meeting.name}</div>
                  <div className="text-xs">
                    {formatDistanceToNow(
                      new Date(meeting.meeting.scheduledStart),
                      {
                        addSuffix: true,
                      },
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium">
                  {meeting.meeting.description}
                </div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                Scheduled:{" "}
                {new Date(meeting.meeting.scheduledStart).toLocaleString()} -{" "}
                {new Date(meeting.meeting.scheduledEnd).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                {meeting.meetingMember.bIsRequiredToAttend === 1 && (
                  <Badge variant="default">Required</Badge>
                )}
                {meeting.meetingMember.bIsHost === 1 && (
                  <Badge variant="outline">
                    <Crown className="mr-2 h-4 w-4" />
                    Host
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="flex h-full w-full flex-col ">
      <MeetingItems />
    </div>
  );
}
