import { createFileRoute, createLazyFileRoute } from "@tanstack/react-router";
import { OrganizationList, UserButton } from "@clerk/clerk-react";
import { useTheme } from "@/theme"; // If you're using Context
import { dark } from "@clerk/themes";
import { z } from "zod";

const urlRedirectSchema = z.object({
  redirect: z.string().url().optional(),
});

export const Route = createFileRoute("/_with-auth/organization-selector")({
  component: OrganizationSelector,
  validateSearch: (search) => urlRedirectSchema.parse(search),
});

function OrganizationSelector() {
  const { theme } = useTheme(); // If you're using Context
  const { redirect } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className=" flex w-[400px] justify-end pb-6">
        <UserButton />
      </div>
      <div className="w-[50vh]">
        <OrganizationList
          appearance={theme === "dark" ? (dark as any) : undefined}
          afterSelectOrganizationUrl={redirect ?? "/workspace"}
        />
      </div>
    </div>
  );
}
