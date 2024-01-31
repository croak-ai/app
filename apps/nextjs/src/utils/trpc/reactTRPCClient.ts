"use client";

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

<<<<<<< Updated upstream
import { type AppRouter } from "@acme/hono-crud/src/trpc";
=======
import { type AppRouter } from "@croak/hono-crud/src/trpc";
>>>>>>> Stashed changes

export const reactTRPC = createTRPCReact<AppRouter>({});

export const createReactTRPCClient = () => {
  return reactTRPC.createClient({
    links: [
      httpBatchLink({
        async headers() {
          //Fetch the active session token to use in TRPC client requests
          const res = await fetch("/api/token");
          console.log("res", res);
          const { sessionToken } = await res.json();
          return {
            Authorization: sessionToken ?? undefined,
          };
        },
        url: `http://localhost:8080/trpc`,
      }),
    ],
    transformer: superjson,
  });
};
