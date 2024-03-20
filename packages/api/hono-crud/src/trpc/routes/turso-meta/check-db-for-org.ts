import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { sql } from "drizzle-orm";

export const checkDBForOrg = router({
  checkDBForOrg: protectedProcedureWithOrgDB.query(async ({ ctx }) => {
    try {
      const allTables = await ctx.db.get(sql`SELECT 1`);

      if (allTables) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }),
});
