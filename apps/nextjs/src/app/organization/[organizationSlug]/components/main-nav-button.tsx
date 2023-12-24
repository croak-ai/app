"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@acme/ui/lib/utils";
import { buttonVariants } from "@acme/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/ui/tooltip";

interface NavProps {
  links: {
    title: string;
    label?: string;
    href: string;
    icon: LucideIcon;
  }[];
}

export function Nav({ links }: NavProps) {
  const pathname = usePathname();
  return (
    <div className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:px-2">
        <div className="flex flex-row gap-4">
          {links.map((link, index) => {
            let variant: "ghost" | "default" = "ghost";

            if (pathname && pathname.startsWith(link.href)) {
              variant = "default";
            } else {
              variant = "ghost";
            }

            return (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      buttonVariants({ variant: variant, size: "icon" }),
                      "h-8 w-8",
                      variant === "default" &&
                        "dark:bg-muted dark:text-muted-foreground",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="flex items-center gap-4"
                >
                  {link.title}
                  {link.label && (
                    <span className="ml-auto text-muted-foreground">
                      {link.label}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
