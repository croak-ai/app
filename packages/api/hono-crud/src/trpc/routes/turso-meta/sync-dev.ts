import { clerkSync } from "../../../functions/cron/clerk-sync";
import { protectedProcedure, router } from "../../config/trpc";

export const syncDev = router({
  syncDev: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.env.DB_ENVIORNMENT_LEVEL !== "dev") {
      throw new Error("This endpoint is only available in dev env");
    }

    if (!ctx.auth.orgId) {
      throw new Error("No organization");
    }

    const { totalInsertedRows } = await clerkSync({
      organizationId: ctx.auth.orgId,
      env: ctx.env,
    });

    return `${totalInsertedRows} rows affected`;
  }),
});
