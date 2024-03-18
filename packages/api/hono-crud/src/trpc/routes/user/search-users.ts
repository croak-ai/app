import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const zSearchUserInput = z.object({
  zSearch: z.string().min(1).max(256),
});

export const searchUsers = router({
  searchUsers: protectedProcedureWithOrgDB

    .input(zSearchUserInput)
    .query(async ({ ctx, input }) => {
      const formattedSearchInput = `"${input.zSearch}"*`;

      const foundUsers = sql`
      SELECT user.userId, user.firstName, user.lastName, user.email, user.imageUrl
      FROM user_fts
      JOIN user ON user_fts.rowid = user.internalId
      WHERE user_fts MATCH ${formattedSearchInput}
      LIMIT 10;
      `;
      const foundUsersResult = await ctx.db.run(foundUsers);

      const zUserSearchResult = z.array(
        z.object({
          userId: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
          imageUrl: z.string().optional(),
        }),
      );

      const parsedResult = zUserSearchResult.parse(foundUsersResult.rows);

      return parsedResult;
    }),
});
