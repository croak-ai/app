import * as React from "react";
import { Check } from "lucide-react";
import { CommandItem } from "@acme/ui/components/ui/command";
import { trpc } from "@/utils/trpc";
import { Avatar, AvatarImage } from "@acme/ui/components/ui/avatar";
import { RouterOutput } from "@/utils/trpc";
import { Icons } from "@acme/ui/components/bonus/icons";
import { UserHoverCard } from "@/components/user/user-card";

type SearchedUser = RouterOutput["searchUsers"]["searchUsers"][0];

export function UserSearchCombobox({
  existingUserIds,
  onSelect,
  searchTerm,
}: {
  existingUserIds: string[];
  onSelect: (user: SearchedUser) => void;
  searchTerm: string;
}) {
  const { data, isFetching } = trpc.searchUsers.searchUsers.useQuery(
    {
      zSearch: searchTerm,
    },
    { enabled: searchTerm.length > 0 },
  );

  const handleSelect = (userId: string) => {
    const user = data?.find((user) => user.userId === userId);
    if (user) {
      onSelect(user);
    }
  };

  const spinner = React.useMemo(
    () => <Icons.spinner className="mx-auto h-4 w-4 animate-spin" />,
    [],
  );
  if (!data) {
    return <></>;
  }

  const UserContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute bottom-full z-10 max-h-60 w-full overflow-auto rounded border border-secondary bg-background p-2 shadow-md">
      {children}
    </div>
  );

  if (isFetching) {
    return <UserContainer>{spinner}</UserContainer>;
  }

  if (data.length === 0) {
    return (
      <UserContainer>
        <span className="y text-sm opacity-50">No users found</span>
      </UserContainer>
    );
  }

  return (
    <UserContainer>
      {data?.map((user) => (
        <UserHoverCard userId={user.userId} side={"right"}>
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
        </UserHoverCard>
      ))}
    </UserContainer>
  );
}
