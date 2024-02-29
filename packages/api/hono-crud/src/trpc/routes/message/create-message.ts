import { message } from "@acme/db/schema/tenant";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";
import { userHasRole } from "../../../functions/clerk";
import OpenAI from "openai";
import { groupMessage } from "../../functions/groupMessage";

export const zCreateMessage = z.object({
  channelId: z.string().min(1).max(256),
  workspaceSlug: z.string().min(2).max(256),
  messageContent: z.string().min(2).max(60000),
});

export type DBMessage = {
  id: string;
  userId: string;
  message: string;
  channelId: string;
  createdAt: number;
  updatedAt: number;
};

export const createMessage = router({
  createMessage: protectedProcedureWithOrgDB
    .input(zCreateMessage)
    .mutation(async ({ ctx, input }) => {
      ////////////////////////////////////////////////////////
      // Check if user has permission to create a message in the channel

      const workspace = await getWorkspacePermission({
        workspaceSlug: input.workspaceSlug,
        userId: ctx.auth.userId,
        db: ctx.db,
      });

      if (!workspace.foundWorkspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (!workspace.hasPermission) {
        const hasRole = await userHasRole({
          auth: ctx.auth,
          role: "org:workspace:all_access",
        });

        if (!hasRole) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "You do not have permission to create a message in this channel!",
          });
        }
      }

      ////////////////////////////////////////////////////////
      // Create the message

      const currentTime = Date.now();

      const [newMessage] = await ctx.db
        .insert(message)
        .values({
          userId: ctx.auth.userId,
          message: input.messageContent,
          channelId: input.channelId,
          createdAt: currentTime,
          updatedAt: currentTime,
        })
        .returning();

      if (!newMessage) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new message",
        });
      }

      const openAI = new OpenAI({ apiKey: ctx.env.OPENAI_API_KEY });
      /* 
      In both of these functions the token count of the messages
      we are throwing into the AI matter.
      In the future we will need to find some way to make sure the
      content of the messages we are pulling does not exceed the count
      */

      /* Group message into conversation */
      await groupMessage(ctx.db, openAI, newMessage);

      /* 
        Summarize messages function here. Pull last x UNSUMMARIZED 
        conversations from channel and their messages AND unsummarized 
        messages. We don't want to pull a convo if they don't have a 
        message in the unsummarized messages table. Then we want to 
        loop through each conversation and summarize ALL conversation 
        messages.
      */

      return newMessage;
    }),
});
