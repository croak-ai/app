import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { type AppRouter } from "@acme/fastify-crud/src/trpc";
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
        url: `${process.env.NEXT_PUBLIC_TRPC_BASE_URL}`,
      }),
    ],
    transformer: superjson,
  });
};
