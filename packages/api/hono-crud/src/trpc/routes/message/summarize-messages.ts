import { channel, message } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";
import { userHasRole } from "../../../functions/clerk";

const zMessage = z.object({
  userId: z.string().min(2).max(256),
  message: z.string().min(2).max(60000),
  channelId: z.number(),
  conversationId: z.number(),
  messageInChannelNumber: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const summarizeMessage = router({
  summarizeMessagee: protectedProcedureWithOrgDB
    .input(zMessage)
    .mutation(async ({ ctx, input }) => {
      //Is message part of existing conversation?
      //Need this to pull past conversations depending on current messages channel

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
      //How should we get the conversation ID here????
      //Possibly load it into the context?
      //Possibly have to keep track of conversations client side (Could get messy)

      const statement = sql`
      INSERT INTO message (userId, message, channelId, conversationId, messageInChannelNumber, createdAt, updatedAt)
      VALUES (
          ${ctx.auth.userId},
          ${input.messageContent},
          ${foundChannel.id},
          ${1},
          (
              SELECT COALESCE(MAX(messageInChannelNumber) + 1, 1)
              FROM message
              WHERE channelId = ${foundChannel.id}
          ),
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      )
      RETURNING id, message, channelId, messageInChannelNumber;
    `;

      const result = await ctx.db.run(statement);

      if (result.rowsAffected !== 1 || !result.rows || !result.rows[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new message",
        });
      }

      return "success";
    }),
});
