import { protectedProcedure, router } from "../../trpc/trpc";
import { sql } from "drizzle-orm";

export const checkDBForOrg = router({
  checkDBForOrg: protectedProcedure.query(async ({ ctx }) => {
    try {
      const allTables = await ctx?.db?.get(sql`SELECT 1`);

      if (allTables) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }),
});
