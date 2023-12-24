"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { Avatar, AvatarImage } from "@acme/ui/components/ui/avatar";
import { Button } from "@acme/ui/components/ui/button";

import {
  Command,
  CommandEmpty,
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
import { useParams } from "next/navigation";
import { Icons } from "@packages/ui/components/bonus/icons";
import { reactTRPC } from "@next/utils/trpc/reactTRPCClient";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Loading from "@packages/ui/components/bonus/loading";
import { Protect, useAuth } from "@clerk/nextjs";

export default function WorkspaceSelection() {
  const [open, setOpen] = React.useState(false);

  const workspaceMemberships =
    reactTRPC.getWorkspaceMemberships.getWorkspaceMemberships.useQuery();

  const params = useParams();

  if (!params) {
    return <Skeleton className="h-5 w-5 rounded-full" />;
  }

  const CurrentWorkspaceAvatar = () => {
    if (typeof params.workspaceSlug === "string") {
      return (
        <Avatar className="mr-2 h-5 w-5">
          <AvatarImage
            src={`https://avatar.vercel.sh/${params.workspaceSlug}.png`}
            alt={params.workspaceSlug}
          />
          <Skeleton className="h-5 w-5 rounded-full" />
        </Avatar>
      );
    }

    return <></>;
  };

  const CurrentWorkspaceText = () => {
    return (
      <span
        className={`max-w-[72px] overflow-hidden overflow-ellipsis whitespace-nowrap pr-4 transition-all md:max-w-[118px] xl:max-w-[244px]`}
      >
        {params.workspaceSlug ? (
          params.workspaceSlug
        ) : (
          <span className="opacity-50">No Workspace Selected </span>
        )}
      </span>
    );
  };

  const WorkspaceOptions = () => {
    if (!workspaceMemberships.isFetched) {
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
              href={`/organization/${params.organizationSlug}/workspace/${membership.workspace.slug}`}
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
                    params.workspaceSlug === membership.workspace.slug
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
    const allWorkspaces =
      reactTRPC.getAllWorkspaces.getAllWorkspaces.useQuery();
    const params = useParams();

    if (!params) {
      return <Skeleton className="h-5 w-5 rounded-full" />;
    }

    if (!workspaceMemberships.isFetched || !allWorkspaces.isFetched) {
      return <Loading />;
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
              href={`/organization/${params.organizationSlug}/workspace/${workspace.slug}`}
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
                    params.workspaceSlug === workspace.slug
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
            <div className="flex">
              <Icons.slash
                style={{ width: "50px", height: "50px" }}
                className="bg-text"
              />
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label="Select a Workspace"
                className="mt-1.5 max-w-2xl"
              >
                <CurrentWorkspaceAvatar />
                <CurrentWorkspaceText />
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </div>
          </PopoverTrigger>

          <PopoverContent className="w-[320px] p-0 " align="start">
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
              <Link
                href={`/organization/${params.organizationSlug}/create-new-workspace/0`}
              >
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
