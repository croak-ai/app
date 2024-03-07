/* Create new thread */

import { assistantThread } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";

export const createThread = router({
  createThread: protectedProcedureWithOrgDB.mutation(async ({ ctx }) => {
    ////////////////////////////////////////////////////////
    // Eventually check if user has permission to use assistant

    /* Create new thread */
    const openAI = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });
    const newThread = await openAI.beta.threads.create();

    /* Insert into database */
    /* This table should hold a description of the thread inside of it somehow */
    const currentTime = Date.now();
    const [assistantThreadResult] = await ctx.db
      .insert(assistantThread)
      .values({
        userId: ctx.auth.userId,
        threadId: newThread.id,
        createdAt: currentTime,
        updatedAt: currentTime,
      })
      .returning();

    if (!assistantThreadResult) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create assistant thread",
      });
    }

    return assistantThreadResult;
  }),
});
