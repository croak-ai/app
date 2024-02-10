"use client";

// import Link from "next/link";
import { LucideIcon } from "lucide-react";
// import { usePathname } from "next/navigation";
import { cn } from "@acme/ui/lib/utils";
import { buttonVariants } from "@acme/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/ui/tooltip";

interface NavProps {
  title: string;
  label?: string;
  href: string;
  icon: LucideIcon;
}

export function Nav(props: NavProps) {
  // const pathname = usePathname();

  // const getVariant = () => {
  //   if (pathname && pathname.startsWith(props.href)) {
  //     return "default";
  //   } else {
  //     return "ghost";
  //   }
  // };
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        {/* <Link
          href={props.href}
          className={cn(
            buttonVariants({ variant: getVariant(), size: "icon" }),
            "h-8 w-8",
            getVariant() === "default" &&
              "dark:bg-muted dark:text-muted-foreground",
          )}
        >
          <props.icon className="h-4 w-4" />
          <span className="sr-only">{props.title}</span>
        </Link> */}
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center" className="mr-8">
        {props.title}
        {props.label && (
          <span className="ml-auto text-muted-foreground">{props.label}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
