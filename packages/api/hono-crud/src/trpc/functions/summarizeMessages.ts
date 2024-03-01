import { DBClientType, desc, exists, eq, and } from "packages/db";
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
    /* 
    Returns unSummarizedMessages from conversationId in outer query
    If no unSummarizedMessages match an existing message in conversation
    WE DONT WANT THAT CONVERSATION 
    */
    /* 
    This query is looking crazy. Maybe we can add the channelId to the unsummarizedMessage
   table. Then we can grab unsummarizedMessages by channelId
   
   But maybe lets build a working query. analyze performance, and then optimize
   */
    /* try this as well
  
  const conversationsWithMessages = await db
  .select({
    conversationId: conversation.id,
    channelId: conversation.channelId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messageId: message.id,
    userId: message.userId,
    message: message.message,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    deletedAt: message.deletedAt
  })
  .from(conversation)
  .innerJoin(conversationMessage, eq(conversation.id, conversationMessage.conversationId))
  .innerJoin(message, eq(conversationMessage.messageId, message.id))
  .leftJoin(unSummarizedMessage, eq(message.id, unSummarizedMessage.messageId))
  .where(eq(conversation.channelId, channelId))
  .groupBy(conversation.id)
  .having(isNotNull(unSummarizedMessage.id));*/

    const unSumConvoSQ = db
      .select()
      .from(conversationMessage)
      .where(eq(conversationMessage.conversationId, conversation.id))
      .innerJoin(message, eq(message.id, conversationMessage.messageId))
      .innerJoin(
        unSummarizedMessage,
        eq(unSummarizedMessage.messageId, message.id),
      )
      .as("sq");

    /* 
    Will grab all conversation messages in a specific channel ONLY 
    if the conversation has atleast ONE unsummarized message
    */
    const unSummarizedMessages = await db
      .select({
        userId: message.userId,
        message: message.message,
        conversationId: conversation.id,
      })
      .from(conversation)
      .where(and(eq(conversation.channelId, channelId), exists(unSumConvoSQ)))
      .innerJoin(
        conversationMessage,
        eq(conversationMessage.conversationId, conversation.id),
      )
      .innerJoin(message, eq(message.id, conversationMessage.messageId));

    console.log("UNSUMMARIZED: ", unSummarizedMessages);

    return;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while summarizing message. ${error}`,
    });
  }
}
