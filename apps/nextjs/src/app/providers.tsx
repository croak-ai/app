"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";

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
    <ClerkProvider>
      <reactTRPC.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </reactTRPC.Provider>
    </ClerkProvider>
  );
}
