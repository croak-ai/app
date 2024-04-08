import { DBClientType, and, desc, eq, gt, lte } from "@acme/db";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";
import {
  conversation,
  conversationMessage,
  message,
  unGroupedMessage,
  user,
} from "@acme/db/schema/tenant";
import { z } from "zod";
import { Bindings } from "../../config";
import { union } from "drizzle-orm/sqlite-core";

export type SingularMessage = {
  id: string;
  userId: string;
  channelId: string;
  message: string;
  createdAt: number;
  nameOfUser: string | null;
};

const zAIGroupingResponse = z.object({
  conversationId: z.string(),
});

/* 
We need to pull last 100 messages from this channel 
Use some SQL query to map messages with their conversations
Then feed this mapped data into AI context and ask it to group
the message
*/

/* Triggers the conversation grouping process */
export async function groupMessage({
  db,
  env,
  newMessage,
}: {
  db: DBClientType;
  env: Bindings;
  newMessage: SingularMessage;
}) {
  try {
    console.log(
      `Grouping message ${newMessage.message} by ${newMessage.nameOfUser}`,
    );

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    /* Pulls 100 most recent conversation linked messages in channel */
    const last100Messages = db
      .select({
        userId: message.userId,
        message: message.message,
        conversationId: conversationMessage.conversationId,
        createdAt: message.createdAt,
        nameOfUser: user.fullName,
      })
      .from(message)
      .where(
        and(
          eq(message.channelId, newMessage.channelId),
          lte(message.createdAt, newMessage.createdAt),
        ),
      )
      .innerJoin(
        conversationMessage,
        eq(message.id, conversationMessage.messageId),
      )
      .leftJoin(user, eq(message.userId, user.userId));

    const next100Messages = db
      .select({
        userId: message.userId,
        message: message.message,
        conversationId: conversationMessage.conversationId,
        createdAt: message.createdAt,
        nameOfUser: user.fullName,
      })
      .from(message)
      .where(
        and(
          eq(message.channelId, newMessage.channelId),
          gt(message.createdAt, newMessage.createdAt),
        ),
      )
      .innerJoin(
        conversationMessage,
        eq(message.id, conversationMessage.messageId),
      )
      .leftJoin(user, eq(message.userId, user.userId));

    const relevantMessagesQuery = union(last100Messages, next100Messages).limit(
      100,
    );

    const relevantMessages = await relevantMessagesQuery.execute();

    if (relevantMessages.length === 0) {
      await createConversation(db, newMessage);
      return;
    }

    const relevantMessagesFormatted = relevantMessages
      .map((row) => ({
        ...row,
        createdAt: new Date(row.createdAt * 1000).toISOString(),
      }))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    const singularMessageFormatted = {
      createdAt: new Date(newMessage.createdAt * 1000).toISOString(),
      userId: newMessage.userId,
      message: newMessage.message,
      conversationId: null,
      nameOfUser: newMessage.nameOfUser,
    };

    // Convert recentMessages to JSON
    const recentMessagesJson = JSON.stringify(relevantMessagesFormatted);
    const singularMessageJson = JSON.stringify(singularMessageFormatted);
    // that runs once per day to scan for these messages and if they are ungrouped
    // we should do the following:

    // 1. Pull last 100 messages from channelId of ungrouped message by date.
    // 2. Run them through AI and insert into conversationMessages as if nothing happened.

    // Note: There's a potential race condition. What happens when this is still
    // running, a message isn't grouped, another message is sent in response and
    // doesn't have this grouped message in the context.
    // */

    //console.log("RecentMessagesJson: ", recentMessagesJson);
    //console.log("SingularMessageJson: ", singularMessageJson);

    /* !!!Talk to Ben about how we should handle these OpenAI clients being created!!! */

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a categorization bot. You will receive a group of messages
          in JSON format followed by a singular message in JSON format. each message
          in the group will have a createdAt, userId, message, conversationId, and most like a nameOfUser. Your task is
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

    console.log(completion.choices[0]?.message.content);

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
    await db.transaction(async (tx) => {
      /* Check if we should make a new conversation or add to an existing one */
      if (AIResponseObject.conversationId === "new") {
        /* If new conversation is added create it and add new message */
        await createConversation(db, newMessage);
      } else if (AIResponseObject.conversationId) {
        /* If existing conversation is found add new message */
        await db.insert(conversationMessage).values({
          conversationId: AIResponseObject.conversationId,
          messageId: newMessage.id,
        });
        AIResponseObject.conversationId;
      }

      console.log(`Deleting ungrouped message ${newMessage.id}`);
      await db
        .delete(unGroupedMessage)
        .where(eq(unGroupedMessage.messageId, newMessage.id));
    });

    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/* Creates a new conversation and new conversationMessage */
async function createConversation(
  db: DBClientType,
  newMessage: SingularMessage,
) {
  const [conversationResult] = await db
    .insert(conversation)
    .values({
      channelId: newMessage.channelId,
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
  return conversationResult.id;
}
