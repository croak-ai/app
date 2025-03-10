import React from "react";
import ReactDOM from "react-dom/client";
import "@acme/ui/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCQueryUtils } from "@trpc/react-query";
import superjson from "superjson";
import { useAuth, useUser } from "@clerk/clerk-react";
import { trpc } from "./utils/trpc";
import { Toaster } from "@acme/ui/components/ui/toaster";

import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "./theme";
import { TooltipProvider } from "@acme/ui/components/ui/tooltip";
import LoadingScreen from "@acme/ui/components/bonus/loading-screen";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    apiUtils: undefined!,
    auth: undefined!,
    user: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const rootElement = document.getElementById("root")!;

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const HONO_URL = import.meta.env.VITE_HONO_URL;

if (!HONO_URL) {
  throw new Error("Missing VITE_HONO_URL");
}

export const queryClient = new QueryClient();

function InnerApp() {
  const auth = useAuth();
  const { user } = useUser();
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          async headers() {
            const authToken = await auth.getToken();

            return {
              Authorization: authToken ?? undefined,
            };
          },
          url: `${HONO_URL}/trpc`,
          transformer: superjson, // Add this line
        }),
      ],
    }),
  );

  // We will use this in the route loaders
  const apiUtils = createTRPCQueryUtils({
    client: trpcClient,
    queryClient,
  });

  if (!auth.isLoaded) {
    return <LoadingScreen>Logging In</LoadingScreen>;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          context={{ apiUtils, auth, user: user ?? undefined }}
        />
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function App() {
  return (
    // Build our routes and render our router
    <>
      <TooltipProvider>
        <ThemeProvider>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <InnerApp />
          </ClerkProvider>
        </ThemeProvider>
      </TooltipProvider>
    </>
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
