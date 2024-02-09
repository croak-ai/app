import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@croak/hono-crud/src/trpc";
import superjson from "superjson";
import React from "react";
import { useAuth } from "@clerk/clerk-react";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      async headers() {
        //Fetch the active session token to use in TRPC client requests
        const res = await fetch("/api/token");
        const { sessionToken } = await res.json();
        return {
          Authorization: sessionToken ?? undefined,
        };
      },
      url: `http://localhost:8080/trpc`,
      transformer: superjson, // Add this line
    }),
  ],
});

export const TRPCProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { getToken } = useAuth();
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          async headers() {
            const authToken = await getToken();

            return {
              Authorization: authToken ?? undefined,
            };
          },
          url: `http://localhost:8080/trpc`,
          transformer: superjson, // Add this line
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

// We will use this in the route loaders
export const apiUtils = createTRPCQueryUtils({
  client: trpcClient,
  queryClient,
});
