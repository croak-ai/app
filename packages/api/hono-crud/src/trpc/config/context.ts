import { createDbClient } from "@acme/db";

import { getAuth } from "@hono/clerk-auth";
import { HonoContext } from "../../config";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { HTTPException } from "hono/http-exception";

export function createTRPCContextFromHonoContext(c: HonoContext) {
  return (opts: FetchCreateContextFnOptions) => {
    /*
     * Here we spawn a new database connection for each request.
     * This is because we can't share a connection between requests in a Cloudflare Worker.
     */

    const auth = getAuth(c);
    const clerk = c.get("clerk");

    if (!auth) {
      throw new HTTPException(401);
    }

    return {
      ...opts,
      clerk,
      auth,
      env: c.env,
    };
  };
}

export type Context = ReturnType<
  ReturnType<typeof createTRPCContextFromHonoContext>
>;
