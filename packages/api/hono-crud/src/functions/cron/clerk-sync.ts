import { Clerk } from "@clerk/backend";
import { getDbAuthToken } from "../db";
import { createDbClient, eq, sql } from "packages/db";
import { user } from "packages/db/schema/tenant";

type InsertUser = typeof user.$inferInsert;
export const clerkSync = async ({
  organizationId,
  env,
}: {
  organizationId: string;
  env: any;
}) => {
  const clerk = Clerk({ apiKey: env.CLERK_SECRET_KEY });

  const orgInfo = await clerk.organizations.getOrganization({
    organizationId: organizationId,
  });

  const tursoGroupName = orgInfo.publicMetadata?.main_database_turso_group_name;
  const tursoDbName = orgInfo.publicMetadata?.main_database_turso_db_name;
  const tursoOrgName = orgInfo.publicMetadata?.main_database_turso_org_name;

  if (!tursoGroupName || !tursoDbName || !tursoOrgName) {
    throw new Error("Organization missing turso metadata");
  }

  const url = `libsql://${tursoDbName}-${tursoOrgName}.turso.io`;
  const token = getDbAuthToken({
    env: env,
    groupName: tursoGroupName as string,
  });

  const db = createDbClient(url, token);

  let offset = 0;
  const limit = 100;
  let hasMore = true;
  let totalInsertedRows = 0;

  while (hasMore) {
    const orgMemberships =
      await clerk.organizations.getOrganizationMembershipList({
        organizationId: organizationId,
        limit: limit,
        offset: offset,
      });

    if (orgMemberships.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }

    const insertData: InsertUser[] = orgMemberships
      .map((membership) => {
        const userData = membership.publicUserData;
        if (!userData) {
          return null;
        }
        return {
          userId: userData.userId,
          role: membership.role as string, // Assuming role is always present and can be cast to string
          email: userData.identifier,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (insertData.length > 0) {
      const result = await db
        .insert(user)
        .values(insertData)
        .onConflictDoUpdate({
          target: user.userId, // Specify the column that triggers the conflict
          set: {
            role: sql`EXCLUDED.role`,
            email: sql`EXCLUDED.email`,
            firstName: sql`EXCLUDED.firstName`,
            lastName: sql`EXCLUDED.lastName`,
            imageUrl: sql`EXCLUDED.imageUrl`,
            updatedAt: Date.now(),
          },
        });
      totalInsertedRows += result.rowsAffected;
    }
  }

  return { totalInsertedRows };
};
