/* Should retrieve the thread and all of its messages */

import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import OpenAI from "openai";

export const zRetrieveThreadMessages = z.object({
  zThreadId: z.string().min(2).max(256),
});

export const retrieveThreadMessages = router({
  retrieveThreadMessages: protectedProcedureWithOrgDB
    .input(zRetrieveThreadMessages)
    .query(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Eventually check if user has permission to use assistant

      /* Retrieve thread and messages */
      console.log("THREAD ID:", input.zThreadId);
      const openAI = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });
      const messages = await openAI.beta.threads.messages.list(
        "thread_65vCj6gyeXdkAZakQPyeprsz",
      );

      console.log("MESSAGES: ", messages.data);
      if (!messages.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find messages in thread",
        });
      }

      return messages.data;
    }),
});
