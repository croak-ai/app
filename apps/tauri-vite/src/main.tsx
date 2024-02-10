import React from "react";
import ReactDOM from "react-dom/client";
import "@acme/ui/styles/globals.css";

import { TRPCProvider } from "./utils/trpc";

import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import SignInPage from "./components/sign-in";
import { ThemeProvider } from "./theme";
import { TooltipProvider } from "@acme/ui/components/ui/tooltip";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const rootElement = document.getElementById("root")!;

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    // Build our routes and render our router
    <>
      <TooltipProvider>
        <ThemeProvider>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <TRPCProvider>
              <SignedIn>
                <RouterProvider router={router} />
              </SignedIn>
              <SignedOut>
                <SignInPage />
              </SignedOut>
            </TRPCProvider>
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
