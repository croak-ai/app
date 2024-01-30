import { type inferAsyncReturnType } from "@trpc/server";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/api";
import { getTursoDbUrlFromClerkTenantId } from "@acme/shared-functions";
import { createDbClient } from "@acme/db";
import { getAuth } from "@hono/clerk-auth";
import { HonoContext } from "../../config";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

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

    const TRPC_TURSO_DB_TOKEN = c.env.TRPC_TURSO_DB_TOKEN;
    const TRPC_TURSO_ORG_SLUG = c.env.TRPC_TURSO_ORG_SLUG;

    if (!TRPC_TURSO_DB_TOKEN || !TRPC_TURSO_ORG_SLUG) {
      throw new Error(
        "No TRPC_TURSO_DB_TOKEN or TRPC_TURSO_ORG_SLUG, make sure you configured your .env file correctly",
      );
    }

    const db = createDbClient(
      `libsql://` +
        getTursoDbUrlFromClerkTenantId({
          tenantId: orgId,
          tursoOrgId: TRPC_TURSO_ORG_SLUG,
        }),
      TRPC_TURSO_DB_TOKEN,
    );

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
