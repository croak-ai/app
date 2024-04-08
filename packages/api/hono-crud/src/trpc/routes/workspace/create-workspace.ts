import { workspace, workspaceMember } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
type newWorkspaceType = typeof workspace.$inferInsert;
import { TRPCError } from "@trpc/server";
import { userHasRole } from "../../../functions/clerk";

export const zCreateWorkspace = z.object({
  zName: z.string().min(2).max(256),
  zDescription: z.string().min(2).max(512),
  zSlug: z.string().min(2).max(256),
});

export const createWorkspace = router({
  createWorkspace: protectedProcedureWithOrgDB
    .input(zCreateWorkspace)
    .mutation(async ({ ctx, input }) => {
      const hasRole = await userHasRole({
        auth: ctx.auth,
        role: "org:workspace:create",
      });

      if (!hasRole) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have permission to create a workspace",
        });
      }
      const newWorkspace: newWorkspaceType = {
        name: input.zName,
        description: input.zDescription,
        slug: input.zSlug,
      };

      const newWorkspaceRes = await ctx.db
        ?.insert(workspace)
        .values(newWorkspace)
        .returning({
          insertedId: workspace.id,
          insertedWorkspaceSlug: workspace.slug,
        });

      const newlyCreatedWorkspace = newWorkspaceRes[0];

      if (!newlyCreatedWorkspace) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new workspace",
        });
      }

      await ctx.db?.insert(workspaceMember).values({
        workspaceId: newlyCreatedWorkspace.insertedId,
        userId: ctx.auth.userId,
        bCanManageChannels: 1,
        bCanManageWorkspaceMembers: 1,
        bCanManageWorkspaceSettings: 1,
      });

      return newlyCreatedWorkspace;
    }),
});
