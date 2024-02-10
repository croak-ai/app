import React, { Suspense } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import OrgLayout from "@/components/main-layout/org-layout";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import SignInPage from "@/components/login/sign-in";
import Spinner from "@/components/Spinner";
import OrganizationSelector from "@/components/login/organization-selector";

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

  if (!isLoaded) {
    return <Spinner />;
  }

  if (isLoaded && !isSignedIn) {
    return <SignInPage />;
  }

  if (isLoaded && !orgSlug) {
    return <OrganizationSelector />;
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
