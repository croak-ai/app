import type { Next } from "hono";
import { trpcServer } from "@hono/trpc-server";

import type { HonoContext } from "../config";
import { appRouter } from "../trpc/routes";

import { createTRPCContextFromHonoContext } from "../trpc/config/context";

export async function trpc(c: HonoContext, next: Next) {
  return trpcServer({
    router: appRouter,
    onError({ error }) {
      console.error(error);
    },
    createContext: createTRPCContextFromHonoContext(c),
  })(c, next);
}
