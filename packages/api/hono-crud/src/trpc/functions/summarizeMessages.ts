import { DBClientType, desc, eq } from "packages/db";
import { DBMessage } from "../routes/message/create-message";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";
import {
  conversation,
  conversationMessage,
  message,
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
export async function summarizeMessages(db: DBClientType, openAI: OpenAI) {
  try {
    return;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong while summarizing message",
    });
  }
}
