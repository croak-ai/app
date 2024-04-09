import { DBClientType, and, desc, eq, gt, inArray, lte } from "@acme/db";
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

const zAICompletionResponse = z.array(
  z.object({
    existingConversationTopicId: z.string().optional(),
    conversationTopicSummary: z.string(),
    messages: z.array(
      z.object({
        messageId: z.string(),
      }),
    ),
  }),
);

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
        messageId: message.id,
        userId: message.userId,
        message: message.message,
        conversationId: conversationMessage.conversationId,
        conversationSummary: conversation.summary,
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
      .leftJoin(
        conversationMessage,
        eq(message.id, conversationMessage.messageId),
      )
      .leftJoin(
        conversation,
        eq(conversationMessage.conversationId, conversation.id),
      )
      .leftJoin(user, eq(message.userId, user.userId));

    const next100Messages = db
      .select({
        messageId: message.id,
        userId: message.userId,
        message: message.message,
        conversationId: conversationMessage.conversationId,
        conversationSummary: conversation.summary,
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
      .leftJoin(
        conversationMessage,
        eq(message.id, conversationMessage.messageId),
      )
      .leftJoin(
        conversation,
        eq(conversationMessage.conversationId, conversation.id),
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
      conversationSummary: null,
      nameOfUser: newMessage.nameOfUser,
    };

    // Convert recentMessages to JSON
    const recentMessagesJson = JSON.stringify(relevantMessagesFormatted);

    const completion = await openai.chat.completions.create({
      //response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a categorization bot. You will receive a group of messages in JSON. Each message
          you receive will be in this type:        
          
          {
            createdAt: string;
            messageId: string;
            userId: string;
            message: string;
            conversationId: string | null;
            conversationSummary: string | null;
            nameOfUser: string | null;
          }

          Your task is to group messages by semantic conversation topics. Each conversation topic should have one summary that can be 
          used to describe the conversation topic in around one paragraph. 

          Even if the messages are apart of the same conversation, that doesn't mean they are apart of the same conversation topic.
          
          Unless the conversation topic deals directly with a User, you
          should refrain from using the user's name in the summary, these summaries are mean't to be used in vector search
          and should be kept as general as possible.
          
          A single message can be apart of many conversation topics, so a conversation topic should only have messages related to a single topic.
          
          If the message is already apart of all the conversation topics that you think it should be apart of you don't need to mention it.

          You should respond with an array of JSON objects that should be able to parse in this zod object:

          Do no include any other text except for the JSON objects in the response.

          do not include any markdown formatting.

          z.array(
            z.object({
              existingConversationTopicId: z.string().optional(),
              conversationTopicSummary: z.string(),
              messages: z.array(
                z.object({
                  messageId: z.string(),
                }),
              ),
            }),
          );

          If you think there should be a new conversation topic, then you should set existingConversationTopicId to undefined.


          Group of messages: ${recentMessagesJson}`,
        },
      ],
      model: "gpt-4-turbo-preview",
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
    console.log(AIResponse);
    const validatedResponse = zAICompletionResponse.safeParse(AIResponse);

    if (!validatedResponse.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "OpenAI response could not be parsed",
      });
    }

    const AIResponseObjects = validatedResponse.data;
    await db.transaction(async (tx) => {
      for (const AIResponseObject of AIResponseObjects) {
        let conversationId = AIResponseObject.existingConversationTopicId;
        if (!conversationId) {
          const [newConversation] = await db
            .insert(conversation)
            .values({
              channelId: newMessage.channelId,
              summary: AIResponseObject.conversationTopicSummary,
            })
            .returning({ insertedId: conversation.id });

          conversationId = newConversation.insertedId;
        } else {
          await db
            .update(conversation)
            .set({
              summary: AIResponseObject.conversationTopicSummary,
            })
            .where(eq(conversation.id, conversationId));
        }

        const messages = AIResponseObject.messages.map((message) => ({
          messageId: message.messageId,
          conversationId: conversationId!,
        }));

        await db
          .insert(conversationMessage)
          .values(messages)
          .onConflictDoNothing();

        await db.delete(unGroupedMessage).where(
          inArray(
            unGroupedMessage.messageId,
            messages.map((m) => m.messageId),
          ),
        );
      }
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
