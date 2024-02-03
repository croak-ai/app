import { protectedProcedure, router } from "../../config/trpc";
import {
  getTursoDbUrlFromClerkOrgId,
  getTursoDbNameFromClerkOrgId,
  getEmptyDatabaseName,
} from "@acme/shared-functions";

export const createNewTursoDB = router({
  createNewTursoDB: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const group = ctx.env.TRPC_TURSO_DEFAULT_GROUP;
      const orgSlug = ctx.env.TRPC_TURSO_ORG_SLUG;
      const tursoToken = ctx.env.TRPC_TURSO_AUTH_TOKEN;

      if (!orgSlug || !tursoToken || !group) {
        throw new Error(
          "No TRPC_TURSO_API_BASE_URL or TRPC_TURSO_ORG_SLUG, or TRPC_TURSO_TOKEN, TRPC_TURSO_DEFAULT_GROUP. Make sure you configured your .env file correctly.",
        );
      }

      const response = await fetch(
        `https://api.turso.tech/v1/organizations/${orgSlug}/databases`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tursoToken}`,
          },
        },
      );

      const data = await response.json();
      const databases: any[] = data.databases;

      const orgId = ctx.auth.orgId;

      if (!orgId) {
        throw new Error("No organization ID");
      }

      const targetTursoDbUrl = getTursoDbUrlFromClerkOrgId({
        orgId: orgId,
        tursoOrgSlug: orgSlug,
      });

      // Make sure the database doesn't already exist
      for (const database of databases) {
        const foundUrl = String(database.Hostname);

        if (foundUrl === targetTursoDbUrl) {
          throw new Error("Database already exists");
        }
      }

      const newDatabaseName = getTursoDbNameFromClerkOrgId(orgId);

      const emptyDatabaseName = getEmptyDatabaseName({ groupName: group });

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
