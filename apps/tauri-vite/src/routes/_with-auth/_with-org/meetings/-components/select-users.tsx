import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@acme/ui/components/ui/button";
import {
  Command,
  CommandItem,
  CommandList,
} from "@acme/ui/components/ui/command";
import { Dialog, DialogContent } from "@acme/ui/components/ui/dialog";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@acme/ui/components/ui/skeleton";
import { Input } from "@acme/ui/components/ui/input";
import { Avatar, AvatarImage } from "@acme/ui/components/ui/avatar";
import { RouterOutput } from "@/utils/trpc";

type SearchedUser = RouterOutput["searchUsers"]["searchUsers"][0];

export function UserSearchCombobox({
  existingUserIds,
  onSelect,
}: {
  existingUserIds: string[];
  onSelect: (user: SearchedUser) => void;
}) {
  const [open, setOpen] = React.useState(false); // Keep the dropdown always open
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState("");

  const { data, isFetching } = trpc.searchUsers.searchUsers.useQuery(
    {
      zSearch: searchTerm,
    },
    { enabled: searchTerm.length > 0 },
  );

  const handleSelect = (userId: string) => {
    const user = data?.find((user) => user.userId === userId);
    if (user) {
      onSelect(user); // Call onSelect without closing the dropdown
    }
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
            disabled={existingUserIds.includes(user.userId)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <Avatar className="mr-2 h-4 w-4">
                <AvatarImage
                  src={user.imageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              </Avatar>
              {user.firstName} {user.lastName}
            </div>
            {existingUserIds.includes(user.userId) && (
              <Check className="h-4 w-4" />
            )}
          </CommandItem>
        ))}
        <div className="h-4" />
      </>
    );
  };

  return (
    <div>
      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={() => setOpen(true)}
      >
        Add user {open ? <ChevronsUpDown /> : null}
      </Button>
      <Dialog modal={true} open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[300px] w-[200px] overflow-y-auto p-0">
          asd
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
