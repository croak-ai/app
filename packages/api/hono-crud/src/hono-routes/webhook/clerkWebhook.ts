import {
  OrganizationMembershipWebhookEvent,
  type EmailAddressJSON,
} from "@clerk/backend";
import { Hono } from "hono";
import type { HonoConfig } from "../../config";
import { createDb } from "../../functions/db";
import { verifyWebhook } from "../../functions/webhook/verifyWebhook";
import { HTTPException } from "hono/http-exception";
import { user } from "@packages/db/schema/tenant";
import { eq } from "@packages/db";

/*
Verify integrity of webhook using svix
Connect to org database using orgId in request
Based on webhook event either create, update, or delete user

*/
export const clerkWebhook = new Hono<HonoConfig>();

clerkWebhook.post("/organizationMembership", async (c) => {
  try {
    const event = (await verifyWebhook(
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

    //Grab orgId
    const orgId = event.data.organization.id; //"org_2beC7yJZqgXIXisWvhNJFbWie4Q";
    const db = createDb({ c, orgId });

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

clerkWebhook.post("/user", async (c) => {
  try {
    const event = (await verifyWebhook(
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

    //Grab orgId
    const orgId = event.data.organization.id; //"org_2beC7yJZqgXIXisWvhNJFbWie4Q";
    const db = createDb({ c, orgId });

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

// function getPrimaryEmail(emails: EmailAddressJSON[], primaryEmailId: string) {
//   const primaryEmail = emails.find(
//     (e) => e.id === primaryEmailId,
//   )?.email_address;

//   // This in theory should never happen since users need to provide an email address to sign up
//   if (!primaryEmail) {
//     throw new Error("No primary email found");
//   }

//   return primaryEmail;
// }
