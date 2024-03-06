import { channel } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { zChannelTypes } from "@acme/db/enum";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";
import { userHasRole } from "../../../functions/clerk";

export const zCreateChannel = z.object({
  zSlug: z.string().min(2).max(256),
  zDescription: z.string().min(2).max(512),
  zWorkspaceSlug: z.string().min(2).max(256),
  zChannelTypes,
});

export const createOrRetrieveThread = router({
  createChannel: protectedProcedureWithOrgDB
    .input(zCreateChannel)
    .mutation(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Eventually check if user has permission to use assistant

      /* 
      Create or retrieve threadID
      If threadID found pull messages as well 
      */
      const newChannel = await ctx.db
        .insert(channel)
        .values({
          slug: input.zSlug,
          channelType: input.zChannelTypes,
          workspaceId: workspace.foundWorkspace.workspace.id,
          description: input.zDescription,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .returning({
          insertedId: channel.id,
          slug: channel.slug,
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
