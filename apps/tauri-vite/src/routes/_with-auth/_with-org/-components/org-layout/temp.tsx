import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@acme/ui/components/ui/avatar";

import { CalendarSearch, User, Users } from "lucide-react";
const MeetingText = ({ meetingText }: { meetingText: string }) => {
  return (
    <span className="rounded bg-primary px-1 text-secondary">
      <CalendarSearch className="mb-1 inline-block h-4 w-4 " /> {meetingText}
    </span>
  );
};

const UserText = ({ userText }: { userText: string }) => {
  return (
    <span className="rounded bg-primary px-0.5 text-secondary">
      <User className="mb-1 inline-block h-4 w-4 " /> {userText}
    </span>
  );
};

const GroupText = ({ groupText }: { groupText: string }) => {
  return (
    <span className="rounded bg-primary px-0.5 text-secondary">
      <Users className="mb-1 inline-block h-4 w-4 " /> {groupText}
    </span>
  );
};

export default function ChatGPTDummy() {
  return (
    <div className="flex flex-col">
      <main className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-start space-x-2">
          <Avatar>
            <AvatarImage alt="@username" src="/ben.jpg" />
            <AvatarFallback>BW</AvatarFallback>
          </Avatar>
          <div className="mt-2 flex flex-col space-y-2 ">
            <h2 className="text-sm font-semibold">Ben Werner</h2>
            <div className="flex items-start justify-between">
              <div className="max-w-[90%] rounded-lg  bg-secondary p-2 text-sm">
                Croak what was <UserText userText="Nick" /> working on Last
                Week?
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Avatar>
            <AvatarImage alt="@username" src="/croak.png" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <div className="mt-2 flex flex-col space-y-2">
            <h2 className="text-sm font-semibold">Croak AI</h2>
            <div className="flex items-start justify-between">
              <div className="max-w-[90%] rounded-lg bg-secondary p-2 text-sm">
                Last week <UserText userText="Nick" /> has been working on
                transition the backend API from Express to tRPC. According to{" "}
                <MeetingText meetingText="Core Eng Standup - 01-09-2024" />. He
                will be working with the <GroupText groupText="security" /> team
                to ensure a safe transition.
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Avatar>
            <AvatarImage alt="@BenWerner" src="/ben.jpg" />
            <AvatarFallback>BW</AvatarFallback>
          </Avatar>
          <div className="mt-2  flex flex-col space-y-2">
            <h2 className="text-sm font-semibold">Ben Werner</h2>
            <div className="flex items-start justify-between">
              <div className="max-w-[90%] rounded-lg bg-secondary  p-2 text-sm ">
                Did <UserText userText="Nick" /> meet with the{" "}
                <GroupText groupText="security" /> team? What did they discuss?
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Avatar>
            <AvatarImage alt="@ChatGPT" src="/croak.png" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <div className=" mt-2 flex flex-col space-y-2">
            <h2 className="text-sm font-semibold">Croak AI</h2>
            <div className="flex items-start justify-between">
              <div className="max-w-[90%] rounded-lg  bg-secondary p-2 text-sm">
                Last week he joined the{" "}
                <span className="rounded bg-primary text-secondary">
                  <CalendarSearch className="mb-1.5 ml-0.5 inline-block h-4 w-4 " />{" "}
                  API Transition Security Team Sync - 01-08-2024
                </span>
                . They discussed many security concerns with tRPC. Three notable
                points are:
                <ul className="list-disc pl-4 pt-2">
                  <li>
                    Ensuring secure data transmission by implementing HTTPS and
                    JWT for authentication.
                  </li>
                  <li>
                    Addressing potential SQL injection vulnerabilities by using
                    parameterized queries or prepared statements.
                  </li>
                  <li>
                    Managing CORS policy to restrict unwanted access from other
                    domains.
                  </li>
                </ul>
                <br />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
