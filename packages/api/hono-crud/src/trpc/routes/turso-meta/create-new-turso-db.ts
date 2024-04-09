import { z } from "zod";
import { protectedProcedure, router } from "../../config/trpc";
import {
  getTursoDbNameFromClerkOrgId,
  getEmptyDatabaseName,
} from "@acme/shared-functions";
import { clerkSync } from "../../../functions/cron/clerk-sync";
import { Clerk } from "@clerk/backend";
import { createClient } from "@tursodatabase/api";
import {
  OrgMetadata,
  updateClerkOrgMetadataKV,
} from "../../../functions/clerk-org-metadata";

const zInput = z.object({ group: z.string() });

export const createNewTursoDB = router({
  createNewTursoDB: protectedProcedure
    .input(zInput)
    .mutation(async ({ ctx, input }) => {
      try {
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

        const turso = createClient({
          org: tursoOrgName,
          token: tursoToken,
        });

        const database = await turso.databases.create(newDatabaseName, {
          group: group,
          seed: {
            type: "database",
            name: emptyDatabaseName,
          },
          schema: "", // Add this line, adjust the value according to your needs or API documentation
        });

        console.log(`Created a new Database! -> ${JSON.stringify(database)}`);

        const clerkClient = Clerk({ secretKey: ctx.env.CLERK_SECRET_KEY });

        const orgMetadata: OrgMetadata = {
          main_database_turso_org_name: tursoOrgName,
          main_database_turso_group_name: group,
          main_database_turso_db_name: database.name,
          main_database_turso_db_url: `libsql://${database.hostname}`,
          main_database_turso_db_id: database.id,
        };

        await clerkClient.organizations.updateOrganizationMetadata(orgId, {
          publicMetadata: {
            database_created: "true",
          },
          privateMetadata: {
            ...orgMetadata,
          },
        });

        await updateClerkOrgMetadataKV({
          clerkSecretKey: clerkToken,
          KV: ctx.env.GLOBAL_KV,
          organizationId: orgId,
        });

        const { totalInsertedRows } = await clerkSync({
          organizationId: orgId,
          env: ctx.env,
        });

        return `Created new database with ${totalInsertedRows} members synced.`;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),
});
