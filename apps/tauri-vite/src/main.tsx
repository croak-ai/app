import React from "react";
import ReactDOM from "react-dom/client";

import { TRPCProvider } from "./utils/trpc";

import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ClerkProvider } from "@clerk/clerk-react";

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
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <TRPCProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools position={"right"} />
        </TRPCProvider>
      </ClerkProvider>
    </>
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
