import { router, protectedProcedureWithOrgDB } from "../../config/trpc";
import { z } from "zod";
import { message, user } from "@acme/db/schema/tenant";
import { desc, eq, and, lte, lt } from "drizzle-orm";

const zCursor = z.object({
  createdAt: z.number(),
  id: z.string(),
});

const zGetMessages = z.object({
  channelId: z.string().min(1).max(256),
  cursor: zCursor.optional(), // Make cursor optional
  limit: z.number().min(1).max(100).default(50),
});

type zCursorType = z.infer<typeof zCursor>;

export const getMessages = router({
  getMessages: protectedProcedureWithOrgDB
    .input(zGetMessages)
    .query(async ({ ctx, input }) => {
      const { channelId, cursor, limit } = input;

      // Start building the query without the condition
      let queryBuilder = ctx.db
        .select()
        .from(message)
        .leftJoin(user, eq(user.userId, message.userId))
        .where(eq(message.channelId, parseInt(channelId, 10)));

      // Only add the lt condition if cursor is provided
      if (cursor) {
        const { createdAt, id } = cursor;

        if (!createdAt || !id) {
          throw new Error("Invalid cursor");
        }
        queryBuilder = queryBuilder.where(
          and(
            lt(message.createdAt, createdAt),
            lt(message.id, parseInt(id, 10)),
          ),
        );
      }

      // Continue building the query
      const messagesQuery = await queryBuilder
        .orderBy(desc(message.createdAt), desc(message.id))
        .limit(limit + 1) // Fetch one more than the limit to check for next page
        .execute(); // Make sure to execute the query

      let nextCursor: zCursorType | undefined = undefined;
      if (messagesQuery.length > limit) {
        const nextMessage = messagesQuery.pop(); // Remove the extra item

        if (!nextMessage) {
          throw new Error("Unexpected error");
        }

        nextCursor = {
          createdAt: nextMessage.message.createdAt,
          id: nextMessage.message.id.toString(),
        };
      }

      console.log(
        `Cursor: ${cursor}, Next cursor: ${nextCursor}, Limit: ${limit}`,
      );

      return {
        messages: messagesQuery,
        nextCursor,
      };
    }),
});
