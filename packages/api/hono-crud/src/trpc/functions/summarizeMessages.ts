import { DBClientType, desc, eq } from "packages/db";
import { DBMessage } from "../routes/message/create-message";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";
import {
  conversation,
  conversationMessage,
  message,
  unSummarizedMessage,
} from "packages/db/schema/tenant";
import { z } from "zod";

const zAIGroupingResponse = z.object({
  conversationId: z.string(),
});

/* 
Summarize messages function here. Pull last x UNSUMMARIZED 
conversations from channel and their messages AND unsummarized 
messages. We don't want to pull a convo if they don't have a 
message in the unsummarized messages table. Then we want to 
loop through each conversation and summarize ALL conversation 
messages.
*/

/* Triggers the conversation summarization process */
export async function summarizeMessages(
  db: DBClientType,
  openAI: OpenAI,
  channelId: string,
) {
  try {
    // Fetch all unsummarized messages from the same channel, sorted by date
    const unSummarizedMessages = await db
      .select({
        userId: message.userId,
        message: message.message,
      })
      .from(unSummarizedMessage)
      .innerJoin(message, eq(message.id, unSummarizedMessage.messageId))
      .where(eq())
      .join(
        "conversationMessage",
        "conversationMessage.messageId",
        "message.id",
      )
      .join(
        "conversation",
        "conversation.id",
        "conversationMessage.conversationId",
      )
      .select("message.*", "conversation.*")
      .orderBy("message.createdAt", "desc");

    // Loop through each unsummarized message and summarize
    for (const msg of unSummarizedMessages) {
      // Summarize the message here
      // You can use the OpenAI instance to summarize the message
      // For example: const summary = await openAI.summarize(msg.message);
      // Then, you can update the message in the database or do whatever you need with the summary
    }
    return;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong while summarizing message",
    });
  }
}
