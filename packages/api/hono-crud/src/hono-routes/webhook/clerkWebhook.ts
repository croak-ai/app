/* ROUTE PREFIX: /webhook */

import {
  OrganizationMembershipWebhookEvent,
  UserWebhookEvent,
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
This route handles organization membership webhook events from Clerk.
If an organization member is added, updated, or removed this code will
reflect the change in the organizations database
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

    /* Grab orgId */
    const orgId = event.data.organization.id;
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
    const event = (await verifyWebhook(c)) as UserWebhookEvent;

    //Grab user data
    //const userData = event.data;

    // const userPayload = {
    //   userId: userData.user_id,
    //   role: event.data.role,
    //   firstName: userData.first_name,
    //   lastName: userData.last_name,
    //   email: userData.identifier,
    //   imageUrl: userData.image_url,
    //   profileImageUrl: userData.profile_image_url,
    //   createdAt: event.data.created_at,
    //   updatedAt: event.data.updated_at,
    // };

    /* Grab orgId */
    // const orgId = event.data.organization.id;
    // const db = createDb({ c, orgId });

    switch (event.type) {
      /* Create user */
      case "user.updated":
        const userData = event.data;
        /* Grab users primary email */
        const userEmail = getPrimaryEmail(
          userData.email_addresses,
          userData.primary_email_address_id,
        );

        /* Grab users organization memberships (Throw this in function eventually)*/
        const userMembershipsRes = await fetch(
          `https://api.clerk.com/v1/users/${userData.id}/organization_memberships?limit=10&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${c.env.CLERK_SECRET_KEY}`,
            },
          },
        );
        const userMemberships: OrganizationMembership =
          await userMembershipsRes.json();

        console.log("DATA: ", userData);
        console.log("EMAIL: ", userEmail);
        console.log("ORGANIZATIONS: ", userMemberships);

        await db.insert(user).values(userPayload);
        return c.text(`User with id ${userPayload.userId} created`, 200);
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

function getPrimaryEmail(emails: EmailAddressJSON[], primaryEmailId: string) {
  const primaryEmail = emails.find(
    (email) => email.id === primaryEmailId,
  )?.email_address;

  // This in theory should never happen since users need to provide an email address to sign up
  if (!primaryEmail) {
    throw new HTTPException(500, {
      message: `Primary email address could not be found`,
    });
  }

  return primaryEmail;
}

type OrganizationMembership = {
  data: {
    object: string;
    id: string;
    public_metadata: Record<string, any>;
    private_metadata: Record<string, any>;
    role: string;
    permissions: string[];
    created_at: number;
    updated_at: number;
    organization: {
      object: string;
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
      has_image: boolean;
      max_allowed_memberships: number;
      admin_delete_enabled: boolean;
      public_metadata: Record<string, any>;
      private_metadata: Record<string, any>;
      created_by: string;
      created_at: number;
      updated_at: number;
      logo_url: string | null;
    };
    public_user_data: {
      first_name: string;
      last_name: string;
      image_url: string | null;
      has_image: boolean;
      identifier: string;
      profile_image_url: string;
      user_id: string;
    };
  }[];
  total_count: number;
};
