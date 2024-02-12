import { createLazyFileRoute } from "@tanstack/react-router";
import { OrganizationList, UserButton } from "@clerk/clerk-react";
import { useTheme } from "@/theme"; // If you're using Context
import { dark } from "@clerk/themes";

function OrganizationSelector() {
  const { theme } = useTheme(); // If you're using Context

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className=" flex w-[400px] justify-end pb-6">
        <UserButton />
      </div>
      <div className="w-[50vh]">
        <OrganizationList
          appearance={theme === "dark" ? (dark as any) : undefined}
        />
      </div>
    </div>
  );
}

export const Route = createLazyFileRoute("/_with-auth/organization-selector")({
  component: OrganizationSelector,
});
