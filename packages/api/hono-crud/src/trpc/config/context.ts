import { type inferAsyncReturnType } from "@trpc/server";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/api";

import { getAuth } from "@hono/clerk-auth";
import { HonoContext } from "../../config";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { createDb } from "../../functions/db";

export function createTRPCContextFromHonoContext(c: HonoContext) {
  return (opts: FetchCreateContextFnOptions) => {
    /*
     * Here we spawn a new database connection for each request.
     * This is because we can't share a connection between requests in a Cloudflare Worker.
     */
    const auth = getAuth(c);
    const clerk = c.get("clerk");

    if (!auth) {
      throw new Error("No auth object");
    }

    const orgId = auth?.orgId;

    if (!orgId) {
      return {
        ...opts,
        db: undefined,
        clerk,
        auth,
        env: c.env,
      };
    }

    const db = createDb({ c, orgId });

    return {
      ...opts,
      db,
      clerk,
      auth,
      env: c.env,
    };
  };
}

export type Context = inferAsyncReturnType<
  typeof createTRPCContextFromHonoContext
>;
