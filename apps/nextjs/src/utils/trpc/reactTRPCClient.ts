import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { type AppRouter } from "@packages/trpc";

export const reactTRPC = createTRPCReact<AppRouter>({});

export const createReactTRPCClient = () => {
  return reactTRPC.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/trpc`,
      }),
    ],
    transformer: superjson,
  });
};
