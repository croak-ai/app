import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { type AppRouter } from "@acme/hono-crud/src/trpc";
import { auth } from "@clerk/nextjs";

export const getServerTRPCClient = () => {
  const { getToken } = auth();

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        async headers() {
          const authToken = await getToken();
          return {
            Authorization: authToken ?? undefined,
          };
        },
        url: `http://localhost:8080/trpc`,
      }),
    ],
    transformer: superjson,
  });
};
