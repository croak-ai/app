import React, { Suspense } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import OrgLayout from "@/components/main-layout/org-layout";
import { useAuth, useUser } from "@clerk/clerk-react";
import Spinner from "@/components/Spinner";
import OnboardNewOrg from "@/components/pre-app/onboard-new-org";
import OrganizationSelector from "@/components/pre-app/organization-selector";
import SignInPage from "@/components/pre-app/sign-in";
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

  if (isLoaded && !orgSlug) {
    return <OrganizationSelector />;
  }

  if (!user) {
    OrganizationSelector;
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
    return <OnboardNewOrg />;
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
