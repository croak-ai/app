import { dekEncryptionKey, workspace } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../trpc";
import { z } from "zod";
type newWorkspaceType = typeof workspace.$inferInsert;
type newDEKEncryptionKeyType = typeof dekEncryptionKey.$inferInsert;
import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const zCreateWorkspace = z.object({
  zSlug: z.string().min(1).max(256),
});

export const workspaceSlugExists = router({
  workspaceSlugExists: protectedProcedureWithOrgDB
    .input(zCreateWorkspace)
    .query(async ({ ctx, input }) => {
      try {
        const workspaceRes = await ctx.db
          ?.select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.zSlug));

        if (workspaceRes.length === 0) {
          return false;
        }

        return true;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new workspace",
        });
      }
    }),
});
