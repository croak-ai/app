import { createDbClient } from "@acme/db";
import { getDbAuthToken } from "../../functions/db";
import { JwtPayload } from "@clerk/types";
import { Bindings } from "../../config";
import { getClerkOrgMetadata } from "../../functions/clerk-org-metadata";

export default async function getDbConnection({
  payload,
  bindings,
}: {
  payload: JwtPayload;
  bindings: Bindings;
}) {
  const clerkInfo = await getClerkOrgMetadata({
    organizationId: payload.org_id,
    KV: bindings.GLOBAL_KV,
    clerkSecretKey: bindings.CLERK_SECRET_KEY,
  });

  const { main_database_turso_db_url, main_database_turso_group_name } =
    clerkInfo;

  const token = getDbAuthToken({
    env: bindings,
    groupName: main_database_turso_group_name,
  });

  return createDbClient(main_database_turso_db_url, token);
}
