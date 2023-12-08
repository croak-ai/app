import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth, signedInAuthObject } from "@clerk/nextjs/server";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
  Organization,
} from "@clerk/nextjs/api";
import { type NextRequest } from "next/server";

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
      "No TRPC_TURSO_API_BASE_URL or TRPC_TURSO_ORG_SLUG, make sure you configured your .env file correctly",
    );
  }

  let dbName = orgId;
  if (dbName.startsWith("org_")) {
    dbName = dbName.replace("org_", "org-").toLowerCase();
  } else {
    throw new Error("Invalid organization ID");
  }

  return {
    auth,
    db: createDbClient(
      `libsql://${dbName}-${TRPC_TURSO_ORG_SLUG}.turso.io`,
      TRPC_TURSO_DB_TOKEN,
    ),
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: { req: NextRequest }) => {
  return await createContextInner({ auth: getAuth(opts.req) });
};

export type Context = inferAsyncReturnType<typeof createContext>;
