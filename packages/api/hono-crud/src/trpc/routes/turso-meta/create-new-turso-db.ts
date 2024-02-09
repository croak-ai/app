import { z } from "zod";
import { protectedProcedure, router } from "../../config/trpc";
import {
  getTursoDbNameFromClerkOrgId,
  getEmptyDatabaseName,
} from "@acme/shared-functions";

const zInput = z.object({ group: z.string() });

export const createNewTursoDB = router({
  createNewTursoDB: protectedProcedure
    .input(zInput)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(input.group);

        if (ctx.auth.orgRole !== "admin") {
          throw new Error("You must be an admin to create a new database.");
        }

        const group = input.group;
        const tursoOrgName = ctx.env.TRPC_TURSO_ORG_SLUG;
        const tursoToken = ctx.env.TRPC_TURSO_AUTH_TOKEN;
        const clerkToken = ctx.env.CLERK_SECRET_KEY;

        if (!tursoOrgName || !tursoToken) {
          throw new Error(
            "No or TRPC_TURSO_ORG_SLUG, or TRPC_TURSO_TOKEN Make sure you configured your .env file correctly.",
          );
        }

        const orgId = ctx.auth.orgId;

        if (!orgId) {
          throw new Error("No organization ID");
        }

        const newDatabaseName = getTursoDbNameFromClerkOrgId(orgId);

        const emptyDatabaseName = getEmptyDatabaseName({ groupName: group });

        const newDatabaseResponse = await fetch(
          `https://api.turso.tech/v1/organizations/${tursoOrgName}/databases`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tursoToken}`,
            },
            body: JSON.stringify({
              name: newDatabaseName,
              group: group,
              seed: {
                Type: "database",
                Name: emptyDatabaseName,
              },
            }),
          },
        );

        if (!newDatabaseResponse.ok) {
          if (newDatabaseResponse.status === 409) {
            throw new Error(`Database already exists. Please Contact Support.`);
          }
          throw new Error(`HTTP error! status: ${newDatabaseResponse.status}`);
        }

        const newDatabaseData = await newDatabaseResponse.json();

        console.log(
          `Created a new Database! -> ${JSON.stringify(newDatabaseData)}`,
        );

        const clerkUpdateResponse = await fetch(
          `https://api.clerk.dev/v1/organizations/${orgId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${clerkToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              public_metadata: {
                main_database_turso_org_name: tursoOrgName,
                main_database_turso_group_name: group,
                main_database_turso_db_name: newDatabaseName,
              },
            }),
          },
        );

        if (!clerkUpdateResponse.ok) {
          throw new Error(
            `Error updating Clerk metadata. HTTP status: ${clerkUpdateResponse.status}`,
          );
        }

        return "Created new database";
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),
});
