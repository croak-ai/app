/* Function designed to update users in each 
organization they have a membership with */

import { HTTPException } from "hono/http-exception";
import { OrganizationMembership } from "./fetchUserMemberships";
import { getDbAuthToken } from "../db";
import { Context } from "hono";
import { HonoConfig } from "../../config";
import { user } from "@acme/db/schema/tenant";
import { createDbClient, eq } from "@acme/db";
import { getClerkOrgMetadata } from "../clerk-org-metadata";

export async function updateOrgUser(
  userMemberships: OrganizationMembership,
  c: Context<HonoConfig>,
): Promise<void> {
  try {
    /* Loop through memberships, connect to orgDB, update user */
    for (const membership of userMemberships.data) {
      const userData = membership.public_user_data;

      const clerkInfo = await getClerkOrgMetadata({
        organizationId: membership.organization.id,
        KV: c.env.GLOBAL_KV,
        clerkSecretKey: c.env.CLERK_SECRET_KEY,
      });

      const { main_database_turso_db_url, main_database_turso_group_name } =
        clerkInfo;

      const token = getDbAuthToken({
        env: c.env,
        groupName: main_database_turso_group_name,
      });

      const db = createDbClient(main_database_turso_db_url, token);

      const updatedUser = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        fullName: `${userData.first_name} ${userData.last_name}`,
        email: userData.identifier,
        imageUrl: userData.image_url,
        profileImageUrl: userData.profile_image_url,
        updatedAt: Date.now(),
      };

      await db
        .update(user)
        .set(updatedUser)
        .where(eq(user.userId, userData.user_id));
    }
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, {
        message: `Unable to update user \n ${error}`,
      });
    }
  }
}
