import { DBClientType, desc, eq } from "packages/db";
import { DBMessage } from "../routes/message/create-message";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";
import {
  conversation,
  conversationMessage,
  message,
} from "packages/db/schema/tenant";

const zAIGroupingResponse = z.object({
  conversationId: z.string(),
});

/* Triggers the conversation grouping process */
export async function groupMessage(
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
          in JSON format followed by a singular message in JSON format. each message
          in the group will have a userId, message, and conversationId. Your task is
          to categorize the singular message into the correct conversationId based on
          the content within the group of messages. If the singular message does not fit
          into the context of any conversations in the group you need to specify that a
          new conversation should be created. for example your answer should look like this
          {"conversationId": "new"}. If the singular message fits into the
          context of a conversation you should specify ONLY the conversationId the
          message belongs to. For example {"conversationId": "123"}. 
  
          Messages do not need to directly match the context of the conversation.
          Messages should be added to existing conversations if you believe the message is
          in response to or referencing a previous message even if it is slightly vague in
          doing so.
  
          If the message seems like it can fit in multiple conversations you should choose
          the conversation that the message fits into the best.
  
          Group of messages: ${recentMessagesJson}
  
          Singular message: ${singularMessageJson}`,
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
    const AIResponse = JSON.parse(completion.choices[0].message.content);
    const validatedResponse = zAIGroupingResponse.safeParse(AIResponse);

    if (!validatedResponse.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "OpenAI response could not be parsed",
      });
    }

    const AIResponseObject = validatedResponse.data;

    /* Check if we should make a new conversation or add to an existing one */
    if (AIResponseObject.conversationId === "new") {
      const conversationResult = await db
        .insert(conversation)
        .values({
          channelId: newMessage.channelId,
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt,
        })
        .returning();

      if (!conversationResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new conversation from AI response",
        });
      }

      // Create a new conversationMessage linked to the new conversation
      await db.table("conversationMessages").insert({
        conversationId: newConversation.id,
        messageId: newMessage.id,
      });
    } else {
      // If the conversationId is not "new", it means the message belongs to an existing conversation
      // So, we just create a new conversationMessage linked to the existing conversation
      await db.table("conversationMessages").insert({
        conversationId: AIResponseObject.conversationId,
        messageId: newMessage.id,
      });
    }

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
