import { DBClientType, desc, eq, sql } from "packages/db";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";
import {
  conversationMessage,
  message,
  conversationSummary,
  conversationSummaryRef,
  user,
} from "packages/db/schema/tenant";
import { Ai as cloudflareAI } from "@cloudflare/ai";

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
  openai: OpenAI,
  cloudflareAI: cloudflareAI,
  conversationId: string,
  channelId: string,
) {
  try {
    /* 
    Fetch all messages and participants in conversation.
    Feed conversation messages to AI model to summarize.
    Create embedding for AI generated summary. (BGE small 384 dimensions)
    Insert summary into conversationSummary table.
    Insert participants into conversationSummaryRef table.
    */
    const fetchConversationMessages = db
      .select({
        firstName: user.firstName,
        lastName: user.lastName,
        userId: message.userId,
        message: message.message,
      })
      .from(conversationMessage)
      .innerJoin(message, eq(message.id, conversationMessage.messageId))

      .innerJoin(user, eq(user.userId, message.userId))
      .where(eq(conversationMessage.conversationId, conversationId))
      .orderBy(desc(message.createdAt));

    const fetchConversationParticipants = db
      .selectDistinct({ userId: message.userId })
      .from(conversationMessage)
      .innerJoin(message, eq(message.id, conversationMessage.messageId))
      .where(eq(conversationMessage.conversationId, conversationId));

    const [conversationMessages, conversationParticipants] = await Promise.all([
      fetchConversationMessages,
      fetchConversationParticipants,
    ]);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a summarization bot that is tasked with summarizing a 
          group of messages in a conversation. Summaries should be as succint as the 
          level of detail provided in the conversation. If specific details are provided
          in the conversation you should mention them in your summary. However small talk
          and irrelevant details should be omitted. Summaries should be made in thirs person
          and refer to participants by their first name.

          Use your own discretion on what you think should be kept or ommitted.
          Only respond with the summary of the conversation.
          
          Group of messages: ${JSON.stringify(conversationMessages)}
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
    const AISummary = completion.choices[0].message.content;

    /* Generate embedding for summary (BGE small 384 dimensions)*/
    const embedding = await cloudflareAI.run<"@cf/baai/bge-small-en-v1.5">(
      "@cf/baai/bge-small-en-v1.5",
      {
        text: AISummary,
      },
    );

    ////////////////////////////////////////////////////////////////////////////
    // Use this if we want to store embeddings as bits in future
    // const float32VectorArray = new Float32Array(embeddingObj.data[0]);
    // const bitVectorArray = new Uint8Array(float32VectorArray.buffer);
    // const blob = new Blob(embeddingObj.data[0]);
    ////////////////////////////////////////////////////////////////////////////

    const currentTime = Date.now();

    const [conversationSummaryResult] = await db
      .insert(conversationSummary)
      .values({
        channelId,
        conversationId,
        summaryText: AISummary,
        summaryEmbedding: JSON.stringify(embedding.data[0]),
        createdAt: currentTime,
        updatedAt: currentTime,
      })
      .returning();

    if (!conversationSummaryResult) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to insert conversation summary into conversationSummary table",
      });
    }

    const participantData = conversationParticipants.map((participant) => ({
      userId: participant.userId,
      conversationSummaryId: conversationSummaryResult.id,
      createdAt: currentTime,
      updatedAt: currentTime,
    }));

    const insertConversationRef = db
      .insert(conversationSummaryRef)
      .values(participantData);

    const vectorSQL = sql`INSERT INTO vss_summaries(rowid, summary_embedding)
                      VALUES (${conversationSummaryResult.id}, 
                      ${JSON.stringify(embedding.data[0])})`;
    const insertVectorSummary = db.run(vectorSQL);

    const [conversationRef, vectorSummary] = await Promise.all([
      insertConversationRef,
      insertVectorSummary,
    ]);

    if (!conversationRef) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to insert conversation participants into conversationSummaryRef table",
      });
    }
    if (!vectorSummary) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to insert conversation summary into vector table",
      });
    }

    return;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while summarizing message. ${error}`,
    });
  }
}
