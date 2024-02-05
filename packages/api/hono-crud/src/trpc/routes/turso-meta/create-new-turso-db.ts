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
        console.log("2");

        const group = input.group;
        const orgSlug = ctx.env.TRPC_TURSO_ORG_SLUG;
        const tursoToken = ctx.env.TRPC_TURSO_AUTH_TOKEN;

        if (!orgSlug || !tursoToken) {
          throw new Error(
            "No or TRPC_TURSO_ORG_SLUG, or TRPC_TURSO_TOKEN Make sure you configured your .env file correctly.",
          );
        }

        const orgId = ctx.auth.orgId;

        if (!orgId) {
          throw new Error("No organization ID");
        }
        console.log("3");
        const newDatabaseName = getTursoDbNameFromClerkOrgId(orgId);

        const emptyDatabaseName = getEmptyDatabaseName({ groupName: group });
        console.log("4");
        const newDatabaseResponse = await fetch(
          `https://api.turso.tech/v1/organizations/${orgSlug}/databases`,
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
        console.log("5");
        if (!newDatabaseResponse.ok) {
          throw new Error(`HTTP error! status: ${newDatabaseResponse.status}`);
        }

        const newDatabaseData = await newDatabaseResponse.json();

        console.log(
          `Created a new Database! -> ${JSON.stringify(newDatabaseData)}`,
        );
        return "Created new database";
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),
});
