/* Create new thread */

import { assistantThread } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import OpenAI from "openai";

export const zCreateThread = z.object({
  zMessage: z.string().max(256),
});

export const createThread = router({
  createThread: protectedProcedureWithOrgDB
    .input(zCreateThread)
    .mutation(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Eventually check if user has permission to use assistant

      const openai = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });

      const newThread = await openai.beta.threads.create();

      await openai.beta.threads.messages.create(newThread.id, {
        role: "user",
        content: input.zMessage,
      });

      const [assistantThreadResult] = await ctx.db
        .insert(assistantThread)
        .values({
          userId: ctx.auth.userId,
          threadId: newThread.id,
          preview: input.zMessage,
          createdAt: newThread.created_at,
          updatedAt: newThread.created_at,
        })
        .returning();

      if (!assistantThreadResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create assistant thread",
        });
      }

      return newThread.id;
    }),
});
