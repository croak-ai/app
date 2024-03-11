import { Card, CardContent } from "@acme/ui/components/ui/card";
import { Button } from "@acme/ui/components/ui/button";
import { X, Crown } from "lucide-react";
import { Badge } from "@acme/ui/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@acme/ui/components/ui/avatar";

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
    <Card>
      <CardContent>
        <div className="p-2">
          {members.map(({ zFullName, zUserId, zImageUrl, zHost }) => (
            <div
              key={zUserId}
              className="mb-2 flex items-center justify-between"
            >
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
                  >
                    <X />
                  </Button>
                )}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingMemberList;
