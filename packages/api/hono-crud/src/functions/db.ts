import { createDbClient } from "@packages/db";
import { getTursoDbUrlFromClerkOrgId } from "@packages/shared-functions/src";
import { HonoContext } from "../config";

export const createDb = ({ c, orgId }: { c: HonoContext; orgId: string }) => {
  return createDbClient(
    getTursoDbUrlFromClerkOrgId({
      orgId,
      tursoOrgSlug: c.env.TRPC_TURSO_ORG_SLUG,
    }),
    c.env.TRPC_TURSO_DB_TOKEN,
  );
};
