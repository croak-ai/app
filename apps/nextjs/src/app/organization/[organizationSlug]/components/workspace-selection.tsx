"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { Avatar, AvatarImage } from "@acme/ui/components/ui/avatar";
import { Button } from "@acme/ui/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandInput,
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

export default function WorkspaceSelection() {
  const [open, setOpen] = React.useState(false);

  const params = useParams();

  if (!params) {
    return <Skeleton className="h-5 w-5 rounded-full" />;
  }

  if (!params.workspaceId) {
    return <></>;
  }

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
                <Avatar className="mr-2 h-5 w-5 ">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/temp.png`}
                    alt={"temp"}
                  />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </Avatar>
                <span
                  className={`max-w-[72px] overflow-hidden overflow-ellipsis whitespace-nowrap pr-4 transition-all md:max-w-[118px] xl:max-w-[144px]`}
                >
                  NAME
                </span>
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </div>
          </PopoverTrigger>

          <PopoverContent className="w-[320px] p-0 " align="start">
            <Command>
              <CommandList>
                <CommandInput placeholder="Search Workspace..." />
                <CommandEmpty>No Workspace found.</CommandEmpty>
                {/* {workspacesWithKeys.map((uniqueRole) => {
                  if (uniqueRole.workspaces.length > 0) {
                    return (
                      <CommandGroup
                        key={uniqueRole.key}
                        heading={formatString(uniqueRole.key)}
                      >
                        {uniqueRole.workspaces.map((workspace) => {
                          return (
                            <Link
                              key={workspace.id}
                              href={`${organizationUrl}/${workspace.workspaceCode}`}
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
                                    src={`https://avatar.vercel.sh/${workspace.workspaceCode}.png`}
                                    alt={workspace.workspaceCode}
                                    className="grayscale"
                                  />
                                  <Skeleton className="h-5 w-5 rounded-full" />
                                </Avatar>
                                <span
                                  className="overflow-ellipsis overflow-hidden max-w-85 whitespace-nowrap"
                                  style={{ maxWidth: '85%' }}
                                >
                                  {workspace.name}
                                </span>
                                <CheckIcon
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    selectedWorkspaceId === workspace.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            </Link>
                          );
                        })}
                      </CommandGroup>
                    );
                  }
                })} */}
              </CommandList>
              <CommandSeparator />
            </Command>
          </PopoverContent>
        </>
      </Popover>
    </>
  );
}
