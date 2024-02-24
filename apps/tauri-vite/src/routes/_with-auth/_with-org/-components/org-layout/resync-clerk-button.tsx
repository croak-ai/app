import { trpc } from "@/utils/trpc";
import { Icons } from "@acme/ui/components/bonus/icons";
import { UserPlus } from "lucide-react";
import { Button } from "@acme/ui/components/ui/button";
import { useToast } from "@acme/ui/components/ui/use-toast";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/ui/tooltip";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" align="center" className="mr-8">
        Resync Clerk Organization
      </TooltipContent>
    </Tooltip>
  );
};

export default function ClerkResyncButton() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const resyncClerk = trpc.syncDev.syncDev.useMutation();

  const handleClick = async () => {
    setSyncing(true);
    try {
      const res = await resyncClerk.mutateAsync();
      toast({
        title: "Synced!",
        description: JSON.stringify(res),
      });
    } catch (e) {
      const Error = e as Error;
      toast({
        title: "Error",
        description: Error.message,
      });
    }
    setSyncing(false);
  };

  return (
    <TooltipProvider>
      <Button
        onClick={handleClick}
        disabled={syncing}
        variant="ghost"
        size="icon"
        className="h-8 w-8"
      >
        {syncing ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus />
        )}
      </Button>
    </TooltipProvider>
  );
}
