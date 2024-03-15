import { CalendarIcon } from "@radix-ui/react-icons";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@acme/ui/components/ui/avatar";
import { useAuth } from "@clerk/clerk-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@acme/ui/components/ui/hover-card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@acme/ui/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@acme/ui/components/ui/dialog";
import { CommandItem, Command } from "@acme/ui/components/ui/command";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { trpc } from "@/utils/trpc";
import { Link, useParams } from "@tanstack/react-router";
import { CheckIcon } from "@radix-ui/react-icons";
import { Button } from "@acme/ui/components/ui/button";
import { useState } from "react";

function UserCard({ userId, enabled }: { userId: string; enabled: boolean }) {
  const { userId: currentUserId } = useAuth();

  const { workspaceSlug } = useParams({ strict: false }) as {
    workspaceSlug: string;
  };

  const { data, isLoading } = trpc.getUserDetails.getUserDetails.useQuery(
    {
      userId,
    },
    { enabled: enabled },
  );

  const SharedWorkspaces = () => {
    if (isLoading || !data) {
      return <Skeleton className="h-12 w-12 rounded-full" />;
    }

    return (
      <div className="pt-2">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center space-x-2 text-xs">
              {data.workspaces.length > 0 ? (
                <>
                  You Share {data.workspaces.length} Workspaces
                  <Button type="button" className="ml-2 h-2">
                    view
                  </Button>
                </>
              ) : (
                "You don't share any workspaces"
              )}
            </div>
          </DialogTrigger>
          <DialogContent>
            Shared Workspaces
            <Command className="">
              {data.workspaces.map((workspace) => (
                <Link
                  key={workspace.slug}
                  to={`/workspace/$workspaceSlug/`}
                  params={{ workspaceSlug: workspace.slug }}
                >
                  <CommandItem key={workspace.id} className="h-12">
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${workspace.slug}.png`}
                        alt={workspace.slug}
                        className="grayscale"
                      />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </Avatar>
                    <span
                      className="max-w-85 overflow-hidden overflow-ellipsis whitespace-nowrap"
                      style={{ maxWidth: "85%" }}
                    >
                      {workspace.name}
                    </span>
                    <CheckIcon
                      className={
                        workspaceSlug === workspace.slug
                          ? "ml-auto h-4 w-4 opacity-100"
                          : "ml-auto h-4 w-4 opacity-0"
                      }
                    />
                  </CommandItem>
                </Link>
              ))}
            </Command>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const UserDetails = () => {
    if (isLoading || !data) {
      return (
        <div className="flex space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="mb-2 h-4 w-48" />
            <Skeleton className="mb-2 h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage src={data.imageUrl || undefined} />
            <AvatarFallback>{data.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{`${data.firstName} ${data.lastName}`}</h4>
            <p className="text-sm">{data.email}</p>
            <div className="flex items-center pt-2">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                Joined {new Date(data.createdAt).toLocaleDateString()}
              </span>
            </div>
            {currentUserId !== userId && <SharedWorkspaces />}
          </div>
        </div>
        <Button className="mt-4 w-full" type="button" variant="outline">
          View Profile
        </Button>
      </div>
    );
  };

  return (
    <div>
      <UserDetails />
    </div>
  );
}

export function UserPopoverCard({
  children,
  side,
  userId,
}: {
  children: React.ReactNode;
  side: "left" | "right" | "top" | "bottom";
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={side}>
        <UserCard userId={userId} enabled={open} />
      </PopoverContent>
    </Popover>
  );
}

export function UserHoverCard({
  children,
  side,
  userId,
}: {
  children: React.ReactNode;
  side: "left" | "right" | "top" | "bottom";
  userId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard openDelay={0} closeDelay={0} open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80" side={side}>
        <UserCard userId={userId} enabled={open} />
      </HoverCardContent>
    </HoverCard>
  );
}
