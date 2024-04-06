/* Retrieve list of threads */

import { assistantThread } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { TRPCError } from "@trpc/server";
import { eq, desc } from "@acme/db";

export const retrieveThreadList = router({
  retrieveThreadList: protectedProcedureWithOrgDB.query(async ({ ctx }) => {
    ////////////////////////////////////////////////////////
    // Eventually check if user has permission to use assistant

    /* Pull list of user threads */
    const threadListResult = await ctx.db
      .select({
        id: assistantThread.id,
        threadId: assistantThread.threadId,
        preview: assistantThread.preview,
      })
      .from(assistantThread)
      .where(eq(assistantThread.userId, ctx.auth.userId))
      .orderBy(desc(assistantThread.updatedAt));

    if (!threadListResult) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to find assistant threads",
      });
    }

    return threadListResult;
  }),
});
