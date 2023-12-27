import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@acme/ui/components/ui/avatar";
import Link from "next/link";
import { Card } from "@acme/ui/components/ui/card";
import WorkspaceSelection from "./workspace-selection";
import { Suspense } from "react";

export default function WorkspaceSidebar() {
  return (
    <div className="flex h-full w-full flex-col ">
      <header className="flex h-16 items-center border-b px-4">
        <WorkspaceSelection />
      </header>
      <main className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-medium">Channels</h2>
        <Card className="p-2">
          <Link className="flex items-center gap-2 text-sm" href="#">
            <span>General</span>
          </Link>
        </Card>
        <Card className="p-2">
          <Link className="flex items-center gap-2 text-sm" href="#">
            <span>Random</span>
          </Link>
        </Card>
        <h2 className="mt-4 text-lg font-medium">Direct Messages</h2>
        <Card className="p-2">
          <Link className="flex items-center gap-2 text-sm" href="#">
            <Avatar>
              <AvatarImage alt="User 1" src="/placeholder-avatar.jpg" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <span>User 1</span>
          </Link>
        </Card>
        <Card className="p-2">
          <Link className="flex items-center gap-2 text-sm" href="#">
            <Avatar>
              <AvatarImage alt="User 2" src="/placeholder-avatar.jpg" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <span>User 2</span>
          </Link>
        </Card>
      </main>
    </div>
  );
}
