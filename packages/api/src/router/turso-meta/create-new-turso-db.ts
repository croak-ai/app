import { protectedProcedure, router } from "../../trpc";
import {
  getTursoDbUrlFromClerkTenantId,
  getTursoDbNameFromClerkTenantId,
} from "@acme/shared-functions";

export const createNewTursoDB = router({
  createNewTursoDB: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const group = process.env.TRPC_TURSO_DEFAULT_GROUP;
      const orgSlug = process.env.TRPC_TURSO_ORG_SLUG;
      const tursoURL = process.env.TRPC_TURSO_API_BASE_URL;
      const tursoToken = process.env.TRPC_TURSO_AUTH_TOKEN;

      if (!orgSlug || !tursoURL || !tursoToken || !group) {
        throw new Error(
          "No TRPC_TURSO_API_BASE_URL or TRPC_TURSO_ORG_SLUG, or TRPC_TURSO_TOKEN, TRPC_TURSO_DEFAULT_GROUP. Make sure you configured your .env file correctly.",
        );
      }

      const response = await fetch(
        `${tursoURL}/v1/organizations/${orgSlug}/databases`,
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

      const targetTursoDbUrl = getTursoDbUrlFromClerkTenantId({
        tenantId: orgId,
        tursoOrgId: orgSlug,
      });

      // Make sure the database doesn't already exist
      for (const database of databases) {
        const foundUrl = String(database.Hostname);

        if (foundUrl === targetTursoDbUrl) {
          throw new Error("Database already exists");
        }
      }

      const newDatabaseName = getTursoDbNameFromClerkTenantId({
        tenantId: orgId,
      });

      const newDatabaseResponse = await fetch(
        `${tursoURL}/v1/organizations/${orgSlug}/databases`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tursoToken}`,
          },
          body: JSON.stringify({
            name: newDatabaseName,
            group: group,
          }),
        },
      );

      const newDatabaseData = await newDatabaseResponse.json();

      if (!newDatabaseData) {
        throw new Error("Failed to create new database");
      }

      console.log(`Created a new Database! -> ${newDatabaseData}`);

      return "Created new database";
    } catch (error) {
      console.error(error);
      throw error;
    }
  }),
});
