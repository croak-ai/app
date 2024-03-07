/* Retrieve list of threads */

import { assistantThread } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "packages/db";

export const retrieveThread = router({
  retrieveThread: protectedProcedureWithOrgDB.query(async ({ ctx }) => {
    ////////////////////////////////////////////////////////
    // Eventually check if user has permission to use assistant

    /* Pull list of user threads */
    const threadListResult = await ctx.db
      .select({
        threadId: assistantThread.threadId,
      })
      .from(assistantThread)
      .where(eq(assistantThread.userId, ctx.auth.userId));

    if (!threadListResult) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to find assistant threads",
      });
    }

    return threadListResult;
  }),
});
