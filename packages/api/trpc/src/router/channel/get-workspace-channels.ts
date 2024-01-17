import { channel } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";

export const zGetWorkspaceChannels = z.object({
  zWorkspaceSlug: z.string().min(2).max(256),
});

export const getWorkspaceChannels = router({
  getWorkspaceChannels: protectedProcedureWithOrgDB
    .input(zGetWorkspaceChannels)
    .query(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Check if user has permission to create a text channel

      const workspace = await getWorkspacePermission({
        workspaceSlug: input.zWorkspaceSlug,
        userId: ctx.auth.userId,
        db: ctx.db,
      });

      if (!workspace.foundWorkspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (!workspace.hasPermission) {
        const hasRole = await ctx.auth.has({
          permission: "org:workspace:all_access",
        });

        if (!hasRole) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You do not have permission to create a text channel",
          });
        }
      }

      ////////////////////////////////////////////////////////
      // Create the channel
      const channels = await ctx.db
        .select()
        .from(channel)
        .where(eq(channel.workspaceId, workspace.foundWorkspace.workspace.id));

      return channels;
    }),
});
