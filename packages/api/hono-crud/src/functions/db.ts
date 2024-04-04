import { createDbClient } from "@acme/db";
import { getClerkOrgMetadata } from "./clerk-org-metadata";
import { Bindings } from "../config";

// env is an any because we want to allow both Hono and Cloudflare environment variables to work.
export const getDbAuthToken = ({
  env,
  groupName,
}: {
  env: any;
  groupName: string;
}) => {
  const enviornmentLevel = env.DB_ENVIORNMENT_LEVEL;

  if (!groupName.startsWith(enviornmentLevel)) {
    throw new Error(
      "You are trying to access a database that is not in your environment",
    );
  }

  const location = groupName.slice(enviornmentLevel.length + 1).toUpperCase();

  return env[`${location}_SECRET`];
};

export const getDbConnection = async ({
  organizationId,
  env,
}: {
  organizationId: string;
  env: Bindings;
}) => {
  const { main_database_turso_db_url, main_database_turso_group_name } =
    await getClerkOrgMetadata({
      organizationId,
      KV: env.GLOBAL_KV,
      clerkSecretKey: env.CLERK_SECRET_KEY,
    });

  const token = getDbAuthToken({
    env: env,
    groupName: main_database_turso_group_name,
  });

  return createDbClient(main_database_turso_db_url, token);
};
