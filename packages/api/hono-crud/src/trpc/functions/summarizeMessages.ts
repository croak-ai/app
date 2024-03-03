import { DBClientType, desc, exists, eq, and, isNotNull } from "packages/db";
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
  conversationId: string,
) {
  try {
    /* 
    OLD THOUGHT: Returns unSummarizedMessages from conversationId in outer query
    If no unSummarizedMessages match an existing message in conversation
    WE DONT WANT THAT CONVERSATION 
    */

    /* Pull all messages from specific conversation */
    const conversationMessages = await db
      .select({
        userId: message.userId,
        message: message.message,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      })
      .from(conversationMessage)
      .innerJoin(message, eq(message.id, conversationMessage.messageId))
      .where(eq(conversationMessage.conversationId, conversationId));

    console.log("WHOLE OBJ: ", conversationMessages);
    console.log("UNSUMMARIZED1: ", conversationMessages[0]);
    console.log("UNSUMMARIZED2: ", conversationMessages[1]);

    return;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while summarizing message. ${error}`,
    });
  }
}
