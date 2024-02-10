import React, { Suspense } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import OrgLayout from "@/components/main-layout/org-layout";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import SignInPage from "@/components/login/sign-in";
import Spinner from "@/components/Spinner";
import OrganizationSelector from "@/components/login/organization-selector";
import CreateMainDB from "@/components/login/create-main-db-form";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

// Set up a Router instance
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { orgSlug, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <Spinner />;
  }

  // If we're not signed in, show the sign in page
  if (isLoaded && !isSignedIn) {
    return <SignInPage />;
  }

  // If we're not in an organization, show the organization selector
  if (isLoaded && !orgSlug) {
    return <OrganizationSelector />;
  }

  // See if we should onboard
  if (!user) {
    return <Spinner />;
  }

  const matchingOrganizationMembership = user.organizationMemberships.find(
    (membership) => membership.organization.slug === orgSlug,
  );
  if (!matchingOrganizationMembership) {
    throw new Error(
      "We couldn't find your organization membership. Please contact support.",
    );
  }

  if (
    !matchingOrganizationMembership.organization.publicMetadata
      .main_database_turso_org_name ||
    !matchingOrganizationMembership.organization.publicMetadata
      .main_database_turso_group_name ||
    !matchingOrganizationMembership.organization.publicMetadata
      .main_database_turso_db_name
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-row pb-6">
          <div className={" mb-4 ml-4 text-center"}>
            <h2 className="text-4xl font-bold">Your Almost There!</h2>
            <h2 className="mt-1 text-2xl font-bold">
              Choose Your Region To Get Started!
            </h2>
          </div>
          <span>s</span>
        </div>
        <div className="w-[50vh]">
          <CreateMainDB />
        </div>
      </div>
    );
  }

  return (
    <>
      <OrgLayout>
        <Outlet />
      </OrgLayout>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
