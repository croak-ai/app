import { conversation } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { eq, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const zMessage = z.object({
  id: z.string().min(2).max(256),
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
      /* OPTIMIZE LATER */
      /*
      Pull x previous conversations in this channel depending on the date
      Ask AI what conversation this message should belong to.

      NOTE: (Context should contain all messages from previous x conversations.
      Context should inform AI that short responses such as "yeah sure" or "I dont like that"
      should be added to closest previous conversation unless it is a direct reply to someone else)

      AI should be able to make an informed decision on what conversation this message should go in.
      Now how do we decide when it should summarize these messages?
      OPTIONS:
      1. We could have a background process that summarizes conversations after 5 
      new messages have been added to the conversation
      2. Summarize conversation after each new message is added. Then update the 
      vector database with the newest summary every time.
      3. When we ask AI to choose which conversation the message belongs in we should, Also ask it 
      if it deems the conversation as "complete" or not.
      If complete we summarize and update vector database. If not we are done.
      */
      ////////////////////////////////////////////////////////
      // Get the channel

      const conversationLimit = 5;

      const recentConversations = await ctx.db
        .select({
          id: conversation.id,
        })
        .from(conversation)
        .where(eq(conversation.channelId, input.channelId))
        .orderBy(desc(conversation.createdAt))
        .limit(conversationLimit);

      // const conversationMessages = await ctx.db
      //   .select()
      //   .from(conversationMessages)
      //   .whereIn(conversationMessages.conversationId, conversationIds);

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
