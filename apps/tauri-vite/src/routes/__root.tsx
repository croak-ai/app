import React, { Suspense } from "react";
import { Outlet } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { apiUtilsType } from "@/utils/trpc";
import type { UserResource } from "@clerk/types";

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
interface RootContext {
  apiUtils: apiUtilsType;
  auth: ReturnType<typeof useAuth>;
  user: UserResource;
}

// Set up a Router instance
export const Route = createRootRouteWithContext<RootContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
