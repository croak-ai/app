import { channel, message } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";

export const zCreateMessage = z.object({
  channelSlug: z.string().min(2).max(256),
  workspaceSlug: z.string().min(2).max(256),
  messageContent: z.string().min(2).max(60000),
});

export const createMessage = router({
  createMessage: protectedProcedureWithOrgDB
    .input(zCreateMessage)
    .mutation(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Check if user has permission to create a message in the channel

      const workspace = await getWorkspacePermission({
        workspaceSlug: input.workspaceSlug,
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
            message:
              "You do not have permission to create a message in this channel!",
          });
        }
      }

      ////////////////////////////////////////////////////////
      // Get the channel
      const foundChannels = await ctx.db
        .select({
          id: channel.id,
          slug: channel.slug,
          workspaceId: channel.workspaceId,
        })
        .from(channel)
        .where(
          and(
            eq(channel.slug, input.channelSlug),
            eq(channel.workspaceId, workspace.foundWorkspace.workspace.id),
          ),
        );

      if (foundChannels.length !== 1 || !foundChannels || !foundChannels[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      const foundChannel = foundChannels[0];

      ////////////////////////////////////////////////////////
      // Create the message
      const newMessage = await ctx.db
        .insert(message)
        .values({
          userId: ctx.auth.userId,
          message: input.messageContent,
          channelId: foundChannel.id, // Assuming the channelId is the same as workspaceId for simplicity
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .returning({
          insertedId: message.id,
          message: message.message,
          channelId: message.channelId,
        });

      if (newMessage.length !== 1 || !newMessage || !newMessage[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new message",
        });
      }

      return newMessage[0];
    }),
});
