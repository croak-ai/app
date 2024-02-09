import React, { Suspense } from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

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
  return (
    <>
      <div className="container py-10">
        <div className="flex gap-2 p-2 text-lg">
          <Link
            to="/"
            activeProps={{
              className: "font-bold",
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
        </div>
        <hr />
        <Outlet />
      </div>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
