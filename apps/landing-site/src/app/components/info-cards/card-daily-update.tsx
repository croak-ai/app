import * as React from "react";
import ChatGPTDummy from "./chat-gpt-chat";
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
export function DailyUpdate() {
  return (
    <div className="">
      <div className=" relative h-3/4 w-1/4 md:h-1/2">
        <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-3xl" />
        <div className="relative flex h-full flex-col items-start  justify-end overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 px-4 py-8 shadow-xl">
          <h1 className="relative z-50 mb-4 text-center text-xl font-bold text-white">
            Know what's happening in your company with <b>Daily Updates</b>.
          </h1>

          <div className="flex items-start space-x-2">
            <Avatar>
              <AvatarImage alt="@ChatGPT" src="/croak.png" />
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
            <div className=" mt-2 flex flex-col space-y-2">
              <h2 className="text-sm font-semibold">Croak AI</h2>
              <div className="flex items-start justify-between">
                <div className="max-w-[90%] rounded-lg  bg-secondary p-2 text-sm">
                  <p>Here is your 01-11-2024 daily update:</p>
                  <ul className="list-disc pl-4 pt-2">
                    <li>
                      <GroupText groupText="Security" />: Discussed potential
                      security vulnerabilities and measures to mitigate them.
                      They are planning to implement HTTPS and JWT for secure
                      data transmission.
                    </li>
                    <li>
                      <GroupText groupText="Core Engineering" />: Discussed the
                      progress of the ongoing projects. They are working on
                      improving the performance of the application.
                    </li>
                    <li>
                      <GroupText groupText="Marketing" />: Reviewed the
                      performance of the recent marketing campaigns. They are
                      planning to launch a new campaign targeting the tech
                      industry.
                    </li>
                    <li>
                      <GroupText groupText="Product" />: Discussed the roadmap
                      for the next quarter. They are planning to introduce new
                      features based on user feedback.
                    </li>
                    <li>
                      <GroupText groupText="HR" />: Discussed the upcoming team
                      building event. They are also working on improving the
                      onboarding process for new hires.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
