"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

import { TooltipProvider } from "@acme/ui/components/ui/tooltip";

import { createReactTRPCClient, reactTRPC } from "@/utils/trpc/reactTRPCClient";
import ClerkProviderWrapper from "./providers/clerk";
import ThemeProvider from "./providers/theme";

export default function TRPC_Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() => createReactTRPCClient());

  return (
    <ThemeProvider>
      <TooltipProvider>
        <ClerkProviderWrapper>
          <reactTRPC.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </reactTRPC.Provider>
        </ClerkProviderWrapper>
      </TooltipProvider>
    </ThemeProvider>
  );
}
