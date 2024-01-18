import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { type AppRouter } from "@acme/fastify-crud/src/trpc";

export const reactTRPC = createTRPCReact<AppRouter>({});

export const createReactTRPCClient = () => {
  return reactTRPC.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_TRPC_BASE_URL}`,
      }),
    ],
    transformer: superjson,
  });
};
