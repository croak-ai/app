import { clerkSync } from "../../../functions/cron/clerk-sync";
import { protectedProcedure, router } from "../../config/trpc";

export const syncDev = router({
  syncDev: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.env.DB_ENVIORNMENT_LEVEL !== "dev") {
      throw new Error("This endpoint is only available in dev env");
    }
    const result = clerkSync({ apiKey: ctx.env.CLERK_SECRET_KEY });

    return result;
  }),
});
