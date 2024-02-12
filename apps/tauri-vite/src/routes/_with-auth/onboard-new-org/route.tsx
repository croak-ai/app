import { createFileRoute } from "@tanstack/react-router";
import { OrganizationSwitcher, UserButton } from "@clerk/clerk-react";
import CreateMainDB from "./-components/-create-main-db-form";
import { useTheme } from "@/theme";
import { dark } from "@clerk/themes";
import { Icons } from "@acme/ui/components/bonus/icons";
import { z } from "zod";

const urlRedirectSchema = z.object({
  redirect: z.string().url().optional(),
});

export const Route = createFileRoute("/_with-auth/onboard-new-org")({
  component: OnboardNewOrg,
  validateSearch: (search) => urlRedirectSchema.parse(search),
});

function OnboardNewOrg() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-row pb-6">
        <div className={" mb-4 ml-4 text-center"}>
          <span className="flex px-6">
            <div className="mt-2">
              <UserButton />
            </div>
            <Icons.slash
              style={{ width: "50px", height: "50px" }}
              className="bg-text"
            />
            <div className="mt-2">
              <OrganizationSwitcher
                afterSelectOrganizationUrl={`/organization/:slug`}
                hidePersonal={true}
                appearance={theme === "dark" ? (dark as any) : undefined}
              />
            </div>
          </span>
          <h2 className="text-4xl font-bold">Your Almost There!</h2>
          <h2 className="mt-1 text-2xl font-bold">
            Choose Your Region To Get Started!
          </h2>
        </div>
      </div>
      <div className="w-[50vh]">
        <CreateMainDB redirect={"/workspace"} />
      </div>
    </div>
  );
}
