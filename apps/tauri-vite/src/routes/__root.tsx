import React, { Suspense } from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import OrgLayout from "@/components/main-layout/org-layout";
import { useAuth } from "@clerk/clerk-react";

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
  const { orgSlug } = useAuth();
  return (
    <>
      <OrgLayout
        defaultCollapsibleIsAICollapsed={true}
        defaultCollapsibleLayoutValues={[50, 25]}
        organizationSlug={orgSlug || ""}
      >
        <Outlet />
      </OrgLayout>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
