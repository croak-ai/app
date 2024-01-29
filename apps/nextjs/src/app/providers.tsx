"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@packages/ui/components/ui/tooltip";
import { useAuth } from "@clerk/nextjs";

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
