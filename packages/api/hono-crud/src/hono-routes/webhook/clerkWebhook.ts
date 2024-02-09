/* ROUTE PREFIX: /webhook */

import {
  OrganizationMembershipWebhookEvent,
  UserWebhookEvent,
  type EmailAddressJSON,
} from "@clerk/backend";
import { Hono } from "hono";
import type { HonoConfig } from "../../config";
import { createDbClient } from "@packages/db";
import { verifyWebhook } from "../../functions/webhook/verifyWebhook";

import { HTTPException } from "hono/http-exception";
import { user } from "@packages/db/schema/tenant";
import { eq } from "@packages/db";
import { getDbAuthToken } from "../../functions/db";
import { fetchUserMemberships } from "../../functions/webhook/fetchUserMemberships";
import { updateOrgUser } from "../../functions/webhook/updateOrgUser";

/*
This route handles organization membership webhook events from Clerk.
If an organization member is added, updated, or removed this code will
reflect the change in the organizations database
*/
export const clerkWebhook = new Hono<HonoConfig>();

clerkWebhook.post("/organizationMembership", async (c) => {
  try {
    const event = (await verifyWebhook(
      c.env.CLERK_ORG_WEBHOOK_SECRET_KEY,
      c,
    )) as OrganizationMembershipWebhookEvent;

    const userData = event.data.public_user_data;

    const userPayload = {
      userId: userData.user_id,
      role: event.data.role,
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: userData.identifier,
      imageUrl: userData.image_url,
      profileImageUrl: userData.profile_image_url,
      createdAt: event.data.created_at,
      updatedAt: event.data.updated_at,
    };

    /* Get DB conection */
    const tursoDbName =
      event.data.organization.public_metadata?.main_database_turso_db_name;
    const tursoGroupName =
      event.data.organization.public_metadata?.main_database_turso_group_name;
    const tursoOrgName =
      event.data.organization.public_metadata?.main_database_turso_org_name;

    const url = `libsql://${tursoDbName}-${tursoOrgName}.turso.io`;
    const token = getDbAuthToken({ c, groupName: tursoGroupName as string });

    const db = createDbClient(url, token);

    switch (event.type) {
      /* Create user */
      case "organizationMembership.created":
        // Check if the user already exists
        const existingUser = await db.query.user.findFirst({
          where: eq(user.userId, userPayload.userId),
        });

        if (existingUser) {
          return c.text(`user with id ${userPayload.userId} already exists.`);
        }
        await db.insert(user).values(userPayload);
        return c.text(`User with id ${userPayload.userId} created`, 200);
      /* Update user */
      /*This is only hit when a users organizaiton role changes*/
      case "organizationMembership.updated":
        await db
          .update(user)
          .set(userPayload)
          .where(eq(user.userId, userPayload.userId));
        return c.text(`User with id ${userPayload.userId} updated`, 200);
      /* Delete user */
      case "organizationMembership.deleted":
        await db.delete(user).where(eq(user.userId, userPayload.userId));
        return c.text(`User with id ${userPayload.userId} deleted`, 200);
      default:
        throw new HTTPException(500, {
          message: "Invalid event type",
        });
    }
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    } else {
      throw new HTTPException(500, {
        message: `Error in Clerk webhook \n ${err}`,
      });
    }
  }
});

/* 
We will eventually need to sync updated user data with each orgs database.
Not a priority for now but sometihng to think about.
The only updates that are currently supported are role updates for 
users in a specific organization.

1. Grab updated user info (Figure out how primary email addresses work in Clerk)
2. Grab all organizations the user is part of.
3. Loop through each organization database and update user info
*/
clerkWebhook.post("/user", async (c) => {
  try {
    const event = (await verifyWebhook(
      c.env.CLERK_USER_WEBHOOK_SECRET_KEY,
      c,
    )) as UserWebhookEvent;

    switch (event.type) {
      /* Update user */
      case "user.updated":
        const userId = event.data.id;

        /* Grab users organization memberships */
        const userMemberships = await fetchUserMemberships(userId, c);

        updateOrgUser(userMemberships, c);

        return c.text(
          `User with id ${userId} updated for all organizations`,
          200,
        );
      default:
        throw new HTTPException(500, {
          message: "Invalid event type",
        });
    }
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    } else {
      throw new HTTPException(500, {
        message: `Error in Clerk webhook \n ${err}`,
      });
    }
  }
});

// function getPrimaryEmail(emails: EmailAddressJSON[], primaryEmailId: string) {
//   const primaryEmail = emails.find(
//     (email) => email.id === primaryEmailId,
//   )?.email_address;

//   // This in theory should never happen since users need to provide an email address to sign up
//   if (!primaryEmail) {
//     throw new HTTPException(500, {
//       message: `Primary email address could not be found`,
//     });
//   }

//   return primaryEmail;
// }
