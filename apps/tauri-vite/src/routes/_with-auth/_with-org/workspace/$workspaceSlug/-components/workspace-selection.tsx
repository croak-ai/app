import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { Avatar, AvatarImage } from "@acme/ui/components/ui/avatar";
import { Button } from "@acme/ui/components/ui/button";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@acme/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/components/ui/popover";
import { trpc } from "@/utils/trpc";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import Loading from "@acme/ui/components/bonus/loading";
import { Protect } from "@clerk/clerk-react";
import { Link, useParams } from "@tanstack/react-router";

export default function WorkspaceSelection() {
  const [open, setOpen] = React.useState(false);

  const { workspaceSlug } = useParams({ strict: false }) as {
    workspaceSlug: string;
  };

  const workspaceMemberships =
    trpc.getWorkspaceMemberships.getWorkspaceMemberships.useQuery();

  const CurrentWorkspaceText = () => {
    return (
      <span
        className={` overflow-hidden overflow-ellipsis whitespace-nowrap pr-4 transition-all`}
      >
        {workspaceSlug ? (
          workspaceSlug
        ) : (
          <span className="opacity-50">No Workspace Selected </span>
        )}
      </span>
    );
  };

  const WorkspaceOptions = () => {
    if (workspaceMemberships.isLoading) {
      return <Loading />;
    }

    if (workspaceMemberships.data?.length === 0) {
      return (
        <div className="mx-4 my-8 text-sm">
          You are not a member of any workspace.
        </div>
      );
    }

    return (
      <CommandGroup heading="Memberships">
        {workspaceMemberships.data?.map((membership) => {
          return (
            <Link
              key={membership.workspace.slug}
              to={`/workspace/$workspaceSlug/`}
              params={{ workspaceSlug: membership.workspace.slug }}
            >
              <CommandItem
                key={membership.workspace.id}
                onSelect={() => {
                  setOpen(false);
                }}
                className="text-sm"
              >
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${membership.workspace.slug}.png`}
                    alt={membership.workspace.slug}
                    className="grayscale"
                  />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </Avatar>
                <span
                  className="max-w-85 overflow-hidden overflow-ellipsis whitespace-nowrap"
                  style={{ maxWidth: "85%" }}
                >
                  {membership.workspace.name}
                </span>
                <CheckIcon
                  className={
                    workspaceSlug === membership.workspace.slug
                      ? "ml-auto h-4 w-4 opacity-100"
                      : "ml-auto h-4 w-4 opacity-0"
                  }
                />
              </CommandItem>
            </Link>
          );
        })}
      </CommandGroup>
    );
  };

  const NotEnrolledWorkspaceOptions = () => {
    const allWorkspaces = trpc.getAllWorkspaces.getAllWorkspaces.useQuery();

    if (!workspaceMemberships.isFetched || !allWorkspaces.isFetched) {
      return <></>;
    }

    if (workspaceMemberships.data?.length === allWorkspaces.data?.length) {
      return <></>;
    }

    return (
      <CommandGroup heading="Not Enrolled (you have all access to all workspaces)">
        {allWorkspaces.data?.map((workspace) => {
          if (
            workspaceMemberships.data?.find(
              (membership) => membership.workspace.id === workspace.id,
            )
          ) {
            return <></>;
          }

          return (
            <Link
              key={workspace.slug}
              to={`/workspace/$workspaceSlug/`}
              params={{ workspaceSlug: workspace.slug }}
            >
              <CommandItem
                key={workspace.id}
                onSelect={() => {
                  setOpen(false);
                }}
                className="text-sm"
              >
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
          );
        })}
      </CommandGroup>
    );
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a Workspace"
              className="flex w-full items-center justify-between "
            >
              <CurrentWorkspaceText />
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="max-h-[300px] w-[320px] p-0 "
            align="start"
          >
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <WorkspaceOptions />
                <Protect permission="org:workspace:all_access">
                  <NotEnrolledWorkspaceOptions />
                </Protect>
                <CommandSeparator />
              </CommandList>
            </Command>
            <Protect permission="org:workspace:create">
              <Link to={`/create-workspace`}>
                <Button
                  variant="outline"
                  className="w-full rounded-none border-none"
                  onClick={() => setOpen(false)}
                >
                  <PlusCircledIcon className="mr-2 h-5 w-5" />
                  Create Workspace
                </Button>
              </Link>
            </Protect>
          </PopoverContent>
        </>
      </Popover>
    </>
  );
}
