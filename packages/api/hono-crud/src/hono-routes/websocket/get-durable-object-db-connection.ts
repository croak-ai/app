import { createDbClient } from "@acme/db";
import { getDbAuthToken } from "../../functions/db";
import { JwtPayload } from "@clerk/types";
import { Bindings } from "../../config";

export default function getDbConnection({
  payload,
  bindings,
}: {
  payload: JwtPayload;
  bindings: Bindings;
}) {
  const anyPayload = payload as any;

  const tursoDbName =
    anyPayload.org_public_metadata.main_database_turso_db_name;
  const tursoGroupName =
    anyPayload.org_public_metadata.main_database_turso_group_name;
  const tursoOrgName =
    anyPayload.org_public_metadata.main_database_turso_org_name;

  const url = `libsql://${tursoDbName}-${tursoOrgName}.turso.io`;
  const token = getDbAuthToken({
    env: bindings,
    groupName: tursoGroupName as string,
  });

  return createDbClient(url, token);
}
