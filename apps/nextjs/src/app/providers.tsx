"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@packages/ui/components/ui/tooltip";
import { useAuth } from "@clerk/nextjs";

import {
  createReactTRPCClient,
  reactTRPC,
} from "../utils/trpc/reactTRPCClient";

export default function TRPC_Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() => createReactTRPCClient());

  return (
    <TooltipProvider>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
      >
        <reactTRPC.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </reactTRPC.Provider>
      </ClerkProvider>
    </TooltipProvider>
  );
}
