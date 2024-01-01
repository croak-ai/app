import { channel } from "@packages/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../trpc";
import { z } from "zod";
import { zChannelTypes } from "@packages/db/enum";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";

export const zCreateTextChannel = z.object({
  zName: z.string().min(2).max(256),
  zDescription: z.string().min(2).max(512),
  zWorkspaceSlug: z.string().min(2).max(256),
  zChannelTypes,
});

export const createWorkspace = router({
  createTextChannel: protectedProcedureWithOrgDB
    .input(zCreateTextChannel)
    .mutation(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Check if user has permission to create a text channel

      const workspace = await getWorkspacePermission({
        workspaceSlug: input.zWorkspaceSlug,
        userId: ctx.auth.userId,
        db: ctx.db,
        bCanManageChannels: true,
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
      const newChannel = await ctx.db
        .insert(channel)
        .values({
          name: input.zName,
          channelType: input.zChannelTypes,
          workspaceId: workspace.foundWorkspace.workspace.id,
          description: input.zDescription,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .returning({
          insertedId: channel.id,
          name: channel.name,
          description: channel.description,
          channelType: channel.channelType,
        });

      if (newChannel.length !== 1 || !newChannel || !newChannel[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new channel",
        });
      }

      return newChannel[0];
    }),
});
