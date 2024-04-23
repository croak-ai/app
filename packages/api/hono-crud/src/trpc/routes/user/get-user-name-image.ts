import { user } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const getUserNameImage = router({
  getUserNameImage: protectedProcedureWithOrgDB
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rawUserDetails = await ctx.db
        .select({
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        })
        .from(user)
        .where(eq(user.userId, input.userId))
        .execute();

      if (rawUserDetails.length === 0) {
        return undefined;
      }

      return rawUserDetails[0];
    }),
});
