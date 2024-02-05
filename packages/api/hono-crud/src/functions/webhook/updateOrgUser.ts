/* Function designed to update users in each 
organization they have a membership with */

import { HTTPException } from "hono/http-exception";
import { OrganizationMembership } from "./fetchUserMemberships";
import { createDb } from "../db";
import { Context } from "hono";
import { HonoConfig } from "../../config";
import { user } from "@packages/db/schema/tenant";
import { eq } from "@packages/db";

export async function updateOrgUser(
  userMemberships: OrganizationMembership,
  c: Context<HonoConfig>,
): Promise<void> {
  try {
    /* Loop through memberships, connect to orgDB, update user */
    for (const membership of userMemberships.data) {
      const userData = membership.public_user_data;
      const orgId = membership.organization.id;
      const db = createDb({ c, orgId });

      const updatedUser = {
        firstName: userData.first_name,
        lastName: userData.last_name,
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
