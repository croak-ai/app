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
      const foundUsers = sql`
      SELECT rowid, firstName, lastName, email 
      FROM user_fts 
      WHERE user_fts MATCH ${input.zSearch}
      LIMIT 10;
    `;

      const foundUsersResult = await ctx.db.run(foundUsers);

      const zUserSearchResult = z.array(
        z.object({
          rowid: z.number(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
        }),
      );

      const parsedResult = zUserSearchResult.parse(foundUsersResult);

      return parsedResult;
    }),
});
