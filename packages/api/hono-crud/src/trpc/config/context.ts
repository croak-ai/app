import { createDbClient } from "@acme/db";

import { getAuth } from "@hono/clerk-auth";
import { HonoContext } from "../../config";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getDbAuthToken } from "../../functions/db";
import { getClerkOrgInfo } from "../../functions/clerk";

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

    const clerkInfo = getClerkOrgInfo({ auth });

    if (!clerkInfo) {
      return {
        ...opts,
        db: undefined,
        clerk,
        auth,
        env: c.env,
      };
    }

    const { tursoDbName, tursoGroupName, tursoOrgName } = clerkInfo;

    const url = `libsql://${tursoDbName}-${tursoOrgName}.turso.io`;
    const token = getDbAuthToken({ c, groupName: tursoGroupName as string });

    const db = createDbClient(url, token);

    return {
      ...opts,
      db,
      clerk,
      auth,
      env: c.env,
    };
  };
}

export type Context = ReturnType<
  ReturnType<typeof createTRPCContextFromHonoContext>
>;
