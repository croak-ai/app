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
      })
      .from(conversationMessage)
      .innerJoin(message, eq(message.id, conversationMessage.messageId))
      .where(eq(conversationMessage.conversationId, conversationId))
      .orderBy(desc(message.createdAt));

    console.log("WHOLE OBJ: ", conversationMessages);
    console.log("UNSUMMARIZED1: ", conversationMessages[0]);
    console.log("UNSUMMARIZED2: ", conversationMessages[1]);

    const conversationMessagesJSON = JSON.stringify(conversationMessages);

    const completion = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a summarization bot that is tasked with summarizing a 
          group of messages in a conversation. Summaries should be as succint as the 
          level of detail provided in the conversation. If specific details are provided
          in the conversation you should mention them in your summary. However small talk
          and irrelevant details should be omitted. 

          Use your own discretion on what you think should be kept or ommitted.
          Only respond with the summary of the conversation.
          
          Group of messages: ${conversationMessagesJSON}
          `,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    if (!completion.choices[0]?.message.content) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Request to OpenAI failed",
      });
    }

    /* Parse and validate response */
    const AIResponse = completion.choices[0].message.content;

    console.log(AIResponse);

    // Generate embedding and add to vector DB

    return;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while summarizing message. ${error}`,
    });
  }
}
