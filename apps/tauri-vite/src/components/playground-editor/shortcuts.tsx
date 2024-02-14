import { FC, Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@acme/ui/components/ui/dropdown-menu";
import { Button } from "@acme/ui/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/ui/tooltip";

interface Shortcut {
  action: () => void;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  name: string;
}

interface ShortcutsProps {
  shortcuts: Shortcut[];
}

export const Shortcuts: FC<ShortcutsProps> = ({ shortcuts }) => {
  return (
    <>
      <div className="hidden sm:flex">
        {shortcuts.map((shortcut, index) => (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                key={index}
                onClick={shortcut.action}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <shortcut.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              {shortcut.name}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={"icon"} className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            {shortcuts.map((shortcut, index) => (
              <Fragment key={index}>
                <DropdownMenuItem onSelect={shortcut.action}>
                  <shortcut.icon className="mr-2 h-4 w-4" />
                  <span>{shortcut.name}</span>
                </DropdownMenuItem>
                {index < shortcuts.length - 1 && <DropdownMenuSeparator />}
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
