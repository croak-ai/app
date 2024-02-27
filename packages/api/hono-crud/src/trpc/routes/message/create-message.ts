import { channel, conversationMessage, message } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";
import { userHasRole } from "../../../functions/clerk";
import { createTextChangeRange } from "typescript";

export const zCreateMessage = z.object({
  channelId: z.string().min(1).max(256),
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
        const hasRole = await userHasRole({
          auth: ctx.auth,
          role: "org:workspace:all_access",
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
      // Create the message

      const currentTime = Date.now();

      const statement = sql`
      INSERT INTO message (userId, message, channelId, createdAt, updatedAt)
      VALUES (
          ${ctx.auth.userId},
          ${input.messageContent},
          ${input.channelId},
          ${currentTime},
          ${currentTime}
      )
      RETURNING id, message, channelId;
    `;

      const result = await ctx.db.run(statement);

      if (result.rowsAffected !== 1 || !result.rows || !result.rows[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new message",
        });
      }

      const grouping = await groupMessage(ctx.db);

      return result.rows[0];
    }),
});

// Function to trigger the conversation grouping process
const groupMessage = async (db: any) => {
  try {
    /* 
    We need to pull last 100 messages from this channel 
    Use some SQL query to map messages with their conversations
    Then feed this mapped data into AI context and ask it to group
    the message
    */

    /* Pulls 100 most recent conversation linked messages in channel */
    const recentMessages = await db
      .select({
        userId: message.userId,
        message: message.message,
        conversationId: conversationMessage.conversationId,
      })
      .from(message)
      .innerJoin(
        conversationMessage,
        eq(message.id, conversationMessage.messageId),
      )
      .orderBy(message.createdAt, "desc")
      .limit(100);

    console.log("RECENTS: ", recentMessages[0]);
    console.log(recentMessages.length);

    return recentMessages;
  } catch (error) {
    // Handle errors
  }
};
