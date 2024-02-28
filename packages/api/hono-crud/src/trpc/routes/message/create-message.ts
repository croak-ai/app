import {
  conversation,
  conversationMessage,
  message,
} from "@acme/db/schema/tenant";
import { DBClientType } from "packages/db";
import { eq, desc } from "drizzle-orm";
import { protectedProcedureWithOrgDB, router } from "../../config/trpc";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

import { TRPCError } from "@trpc/server";
import { getWorkspacePermission } from "../../functions/workspace";
import { userHasRole } from "../../../functions/clerk";
import OpenAI from "openai";
import { createTextChangeRange } from "typescript";

export const zCreateMessage = z.object({
  channelId: z.string().min(1).max(256),
  workspaceSlug: z.string().min(2).max(256),
  messageContent: z.string().min(2).max(60000),
});

export const DBMessage = z.object({
  id: z.string(),
  userId: z.string(),
  message: z.string(),
  channelId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type DBMessage = z.infer<typeof DBMessage>;

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

/* Triggers the conversation grouping process */
async function groupMessage(
  db: DBClientType,
  openAI: OpenAI,
  newMessage: DBMessage,
) {
  try {
    /* !! We need to change some DB types from ints to 
    strings if we are eventually going to use UUIDs !! 
    */
    /* 
    We need to pull last 100 messages from this channel 
    Use some SQL query to map messages with their conversations
    Then feed this mapped data into AI context and ask it to group
    the message
    */

    /* Pulls 100 most recent conversation linked messages in channel */
    const recentMessages = await db
      .select({
        userId: message.userId,
        message: message.message,
        conversationId: conversationMessage.conversationId,
      })
      .from(message)
      .where(eq(message.channelId, newMessage.channelId))
      .innerJoin(
        conversationMessage,
        eq(message.id, conversationMessage.messageId),
      )
      .orderBy(desc(message.createdAt))
      .limit(100);

    if (recentMessages.length === 0) {
      await createConversation(db, newMessage);
      return;
    }
    // Convert recentMessages to JSON
    const recentMessagesJson = JSON.stringify(recentMessages);
    const singularMessageJson = JSON.stringify({
      userId: newMessage.userId,
      message: newMessage.message,
      conversationId: null,
    });

    /* 
    Create process to retry openAI query 3 times. Rearrange DB maybe add switch 
    to messages to show which ones haven't been grouped. Then we have a process 
    that runs once per day to scan for these messages and if they are ungrouped 
    we should do the following:

    1. Pull last 100 messages from channelId of ungrouped message by date.
    2. Run them through AI and insert into conversationMessages as if nothing happened.

    Note: There's a potential race condition. What happens when this is still 
    running, a message isn't grouped, another message is sent in response and 
    doesn't have this grouped message in the context.
    */

    /* 
    Pass x recent messages and new message into AI
    Determine what conversation it should go into 
    */
    console.log("RecentMessagesJson: ", recentMessagesJson);
    console.log("SingularMessageJson: ", singularMessageJson);

    /* Talk to Ben about how we should handle these OpenAI clients being created */

    const completion = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a categorization bot. You will receive a group of messages
        in JSON format followed by a singular message in json format. each message
        in the group will have a userId, message, and conversationId. Your task is
        to categorize the singular message into the correct conversationId based on
        the content within the group of messages. If the singular message does not fit
        into the context of any conversations in the group you need to specify that a
        new conversation should be created. If the singular message fits into the
        context of a conversation you should specify ONLY the conversationId the
        message belongs to.

        If the message seems like it can fit in multiple conversations you should choose
        the conversation that the message fits into the best.

        Group of messages: ${recentMessagesJson}

        Singular message: ${singularMessageJson}`,
        },
      ],
      model: "gpt-3.5",
    });

    console.log("Completion: ", completion);

    return recentMessages;
  } catch (error) {
    // Handle errors
  }
}

/* Creates a new conversation and new conversationMessage */
async function createConversation(db: DBClientType, newMessage: DBMessage) {
  const [conversationResult] = await db
    .insert(conversation)
    .values({
      id: createId(),
      channelId: newMessage.channelId,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    })
    .returning();

  if (!conversationResult) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create new conversation",
    });
  }

  const [conversationMessageResult] = await db
    .insert(conversationMessage)
    .values({
      id: createId(),
      messageId: newMessage.id,
      conversationId: conversationResult.id,
    })
    .returning();

  if (!conversationMessageResult) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to link message to conversation",
    });
  }
}
