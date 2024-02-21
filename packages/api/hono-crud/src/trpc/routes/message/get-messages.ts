import { router, protectedProcedureWithOrgDB } from "../../config/trpc";
import { z } from "zod";
import { message, user } from "@acme/db/schema/tenant";
import { asc, desc, eq, and, gt, lt, or, lte, gte } from "drizzle-orm";

const zCursor = z.object({
  createdAt: z.number(),
  id: z.string(),
  direction: z.enum(["next", "previous"]),
  includeCursorInResult: z.boolean().optional(),
});

const zGetMessages = z.object({
  channelId: z.string().min(1).max(256),
  cursor: zCursor,
  limit: z.number().min(1).max(100).default(50),
});

type zCursorType = z.infer<typeof zCursor>;

export const getMessages = router({
  getMessages: protectedProcedureWithOrgDB
    .input(zGetMessages)
    .query(async ({ ctx, input }) => {
      if (!input.cursor) {
        throw new Error("Cursor is required");
      }

      const { channelId, cursor, limit } = input;

      // Start building the query without the condition
      let queryBuilder = ctx.db
        .select()
        .from(message)
        .leftJoin(user, eq(user.userId, message.userId))
        .where(eq(message.channelId, parseInt(channelId, 10)));

      const { createdAt, id, direction, includeCursorInResult } = cursor;
      if (direction === "next") {
        queryBuilder = queryBuilder
          .where(
            or(
              lt(message.createdAt, createdAt),
              and(
                lte(message.createdAt, createdAt),
                lt(message.id, parseInt(id, 10)),
              ),
              includeCursorInResult
                ? eq(message.id, parseInt(id, 10))
                : undefined,
            ),
          )
          .orderBy(desc(message.createdAt), desc(message.id));
      }

      if (direction === "previous") {
        queryBuilder = queryBuilder
          .where(
            or(
              gt(message.createdAt, createdAt),
              and(
                gte(message.createdAt, createdAt),
                gt(message.id, parseInt(id, 10)),
              ),
              includeCursorInResult
                ? eq(message.id, parseInt(id, 10))
                : undefined,
            ),
          )
          .orderBy(asc(message.createdAt), asc(message.id));
      }

      const messagesQuery = await queryBuilder
        .limit(limit) // Fetch one more than the limit to check for next page
        .execute(); // Make sure to execute the query

      if (cursor.direction === "previous") {
        messagesQuery.sort((a, b) => {
          if (a.message.createdAt === b.message.createdAt) {
            return b.message.id - a.message.id;
          }
          return b.message.createdAt - a.message.createdAt;
        });
      }

      let nextCursor: zCursorType | undefined = undefined;
      let previousCursor: zCursorType | undefined = undefined;
      const firstMessage = messagesQuery[0]; // Get the first item without removing it
      const lastMessage = messagesQuery[messagesQuery.length - 1]; // Get the last item without removing it

      if (!firstMessage || !lastMessage) {
        if (direction === "next") {
          const messages: typeof messagesQuery = [];
          const previousCursor: zCursorType = {
            ...cursor,
            direction: "previous",
            includeCursorInResult: true,
          };
          return {
            messages,
            previousCursor,
          };
        }
        if (direction === "previous") {
          const messages: typeof messagesQuery = [];
          const nextCursor: zCursorType = {
            ...cursor,
            direction: "next",
            includeCursorInResult: true,
          };
          return {
            messages,
            nextCursor,
          };
        }

        throw new Error("Unknown Error");
      }

      previousCursor = {
        createdAt: firstMessage.message.createdAt,
        id: firstMessage.message.id.toString(),
        direction: "previous",
      };

      // If the direction is "next" and the length of the messages is less than the limit, then there are no more messages.
      if (cursor.direction === "next" && messagesQuery.length < limit) {
        return {
          messages: messagesQuery,
          previousCursor,
        };
      }

      nextCursor = {
        createdAt: lastMessage.message.createdAt,
        id: lastMessage.message.id.toString(),
        direction: "next",
      };

      return {
        messages: messagesQuery,
        nextCursor,
        previousCursor,
      };
    }),
});
