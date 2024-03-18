/* Create new thread */

import { assistantThread } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const zCreateThread = z.object({
  zThreadId: z.string().min(2).max(256),
  zPreview: z.string().max(256),
  zCreatedAt: z.number(),
});

export const createThread = router({
  createThread: protectedProcedureWithOrgDB
    .input(zCreateThread)
    .mutation(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Eventually check if user has permission to use assistant

      /* Insert into database */
      /* This table should hold a description of the thread inside of it somehow */
      const [assistantThreadResult] = await ctx.db
        .insert(assistantThread)
        .values({
          userId: ctx.auth.userId,
          threadId: input.zThreadId,
          preview: input.zPreview,
          createdAt: input.zCreatedAt,
          updatedAt: input.zCreatedAt,
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
