import { router, protectedProcedureWithOrgDB } from "../../config/trpc";
import { z } from "zod";
import { message, user } from "@acme/db/schema/tenant";
import { desc, eq } from "drizzle-orm";

const zGetNewestMessage = z.object({
  channelId: z.string().min(1).max(256),
});

export const getNewestMessage = router({
  getNewestMessage: protectedProcedureWithOrgDB
    .input(zGetNewestMessage)
    .query(async ({ ctx, input }) => {
      const { channelId } = input;

      const newestMessageQuery = await ctx.db
        .select()
        .from(message)
        .leftJoin(user, eq(user.userId, message.userId))
        .where(eq(message.channelId, channelId))
        .orderBy(desc(message.createdAt), desc(message.id))
        .limit(1)
        .execute();

      const newestMessage = newestMessageQuery[0];

      if (newestMessage?.message) {
        return {
          message: newestMessage,
        };
      }

      return undefined;
    }),
});
