import { Button } from "@acme/ui/components/ui/button";
import { X, Crown } from "lucide-react";
import { Badge } from "@acme/ui/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@acme/ui/components/ui/avatar";
import { UserHoverCard } from "@/components/user/user-card";

interface MemberListProps {
  members: {
    zFullName?: string | undefined;
    zImageUrl?: string | undefined;
    zUserId: string;
    zRequired: boolean;
    zHost: boolean;
  }[];
  onRemoveMember: (zUserId: string) => void;
}

const MeetingMemberList: React.FC<MemberListProps> = ({
  members,
  onRemoveMember,
}) => {
  return (
    <div>
      {members.length > 0 && (
        <div className="mb-2 text-sm">
          You have <b>{members.length}</b> members in this meeting
        </div>
      )}
      <div className="max-h-60 w-full space-y-2 overflow-auto rounded-sm bg-card p-2">
        {members.map(({ zFullName, zUserId, zImageUrl, zHost }) => (
          <UserHoverCard userId={zUserId} side={"right"}>
            <div key={zUserId} className="flex items-center justify-between">
              <Badge variant={"outline"}>
                {zHost && <Crown className="mr-2 h-4 w-4 text-primary" />}

                <Avatar className="mr-2 h-4 w-4">
                  <AvatarImage src={zImageUrl} alt={zFullName} />
                  <AvatarFallback>
                    {zFullName ? zFullName[0] : "?"}
                  </AvatarFallback>
                </Avatar>
                {zFullName}
                {!zHost && (
                  <Button
                    onClick={() => onRemoveMember(zUserId)}
                    aria-label="Remove member"
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-4 w-4"
                    type="button"
                  >
                    <X />
                  </Button>
                )}
              </Badge>
            </div>
          </UserHoverCard>
        ))}
      </div>
    </div>
  );
};

export default MeetingMemberList;
