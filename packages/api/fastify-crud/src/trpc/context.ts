import { type inferAsyncReturnType } from "@trpc/server";
import { getAuth } from "@clerk/nextjs/server";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/api";
import { type NextRequest } from "next/server";
import { getTursoDbUrlFromClerkTenantId } from "@acme/shared-functions";

import { createDbClient } from "@acme/db";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type AuthContextProps = {
  auth: SignedInAuthObject | SignedOutAuthObject;
};

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
export const createContextInner = async ({ auth }: AuthContextProps) => {
  const orgId = auth?.orgId;

  if (!orgId) {
    throw new Error("No organization ID");
  }

  const TRPC_TURSO_DB_TOKEN = process.env.TRPC_TURSO_DB_TOKEN;
  const TRPC_TURSO_ORG_SLUG = process.env.TRPC_TURSO_ORG_SLUG;

  if (!TRPC_TURSO_DB_TOKEN || !TRPC_TURSO_ORG_SLUG) {
    throw new Error(
      "No TRPC_TURSO_DB_TOKEN or TRPC_TURSO_ORG_SLUG, make sure you configured your .env file correctly",
    );
  }

  try {
    return {
      auth,
      db: createDbClient(
        `libsql://` +
          getTursoDbUrlFromClerkTenantId({
            tenantId: orgId,
            tursoOrgId: TRPC_TURSO_ORG_SLUG,
          }),
        TRPC_TURSO_DB_TOKEN,
      ),
    };
  } catch (error) {
    console.error("Failed to create DB client, returning auth only", error);
    return {
      auth,
    };
  }
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: { req: NextRequest }) => {
  return await createContextInner({ auth: getAuth(opts.req) });
};

export type Context = inferAsyncReturnType<typeof createContext>;
