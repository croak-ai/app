import { router, protectedProcedureWithOrgDB } from "../../config/trpc";
import { z } from "zod";
import { message, user } from "@acme/db/schema/tenant";
import { desc, eq } from "drizzle-orm";

const zGetMessages = z.object({
  channelId: z.string().min(1).max(256),
  cursor: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(50),
});
export const getMessages = router({
  getMessages: protectedProcedureWithOrgDB
    .input(zGetMessages)
    .query(async ({ ctx, input }) => {
      const { channelId, cursor, limit } = input;

      // Fetch `limit + 1` messages to determine if there's a next page
      const messagesQuery = await ctx.db
        .select()
        .from(message)
        .leftJoin(user, eq(user.userId, message.userId))
        .where(eq(message.channelId, parseInt(channelId, 10)))
        .orderBy(desc(message.messageInChannelNumber))
        .limit(limit + 1) // Fetch one more than the limit to check for next page
        .offset(cursor);

      let nextCursor: number | undefined = undefined;
      if (messagesQuery.length > limit) {
        const nextMessage = messagesQuery.pop(); // Remove the extra item
        nextCursor = nextMessage!.message.messageInChannelNumber; // Assuming `messageInChannelNumber` can be used as a cursor
      }

      return {
        messages: messagesQuery,
        nextCursor,
      };
    }),
});
