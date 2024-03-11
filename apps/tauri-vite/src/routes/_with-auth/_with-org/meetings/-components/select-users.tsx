import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@acme/ui/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@acme/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/components/ui/popover";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { Input } from "@acme/ui/components/ui/input";

export function UserSearchCombobox() {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState("");

  const { data, isFetching } = trpc.searchUsers.searchUsers.useQuery(
    {
      zSearch: searchTerm,
    },
    { enabled: searchTerm.length > 0 },
  );

  const handleSelect = (userId: string) => {
    setSelectedUser(userId);
    setOpen(false);
  };

  const UserList = () => {
    if (isFetching) {
      return <Skeleton />;
    }

    if (data?.length === 0) {
      return <CommandItem>No users found</CommandItem>;
    }

    return (
      <>
        {data?.map((user) => (
          <CommandItem
            key={user.userId}
            onSelect={() => handleSelect(user.userId)}
          >
            {user.firstName} {user.lastName}
          </CommandItem>
        ))}
      </>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedUser
            ? data?.find((user) => user.userId === selectedUser)?.firstName ||
              "Select user..."
            : "Select user..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[100px] w-[200px] overflow-y-auto p-0">
        <Command>
          <CommandList>
            <Input
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <UserList />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
