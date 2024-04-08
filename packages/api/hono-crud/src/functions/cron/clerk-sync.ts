import { Clerk } from "@clerk/backend";
import { getDbAuthToken } from "../db";
import { createDbClient, eq, sql } from "@acme/db";
import { user } from "@acme/db/schema/tenant";
import { getClerkOrgMetadata } from "../clerk-org-metadata";

type InsertUser = typeof user.$inferInsert;
export const clerkSync = async ({
  organizationId,
  env,
}: {
  organizationId: string;
  env: any;
}) => {
  const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });

  const clerkInfo = await getClerkOrgMetadata({
    organizationId: organizationId,
    KV: env.GLOBAL_KV,
    clerkSecretKey: env.CLERK_SECRET_KEY,
  });

  const { main_database_turso_db_url, main_database_turso_group_name } =
    clerkInfo;

  const token = getDbAuthToken({
    env: env,
    groupName: main_database_turso_group_name,
  });

  const db = createDbClient(main_database_turso_db_url, token);

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
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: `${userData.firstName} ${userData.lastName}`,
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
            fullName: sql`EXCLUDED.fullName`,
            imageUrl: sql`EXCLUDED.imageUrl`,
            updatedAt: Date.now() / 1000,
          },
        });
      totalInsertedRows += result.rowsAffected;
    }
  }

  return { totalInsertedRows };
};
