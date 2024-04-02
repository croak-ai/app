// Creates a new assistant if one has not already been created
//In the future maybe we can specify the type of assistant in params
//Will have no params. Will return openai assistant.
//Check if assistant already exists (we will pull a json file )
import * as fs from "fs";
import openai from "../client";
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants";
const assistantPath = "./src/ai/assistant.json";

export async function createOrRetrieveAssistant() {
  try {
    // Attempt to pull assistant config locally
    const assistantData = await fs.promises.readFile(assistantPath, "utf8");
    const assistantDetails = JSON.parse(assistantData);
    const assistantId = assistantDetails.assistantId;

    return await openai.beta.assistants.retrieve(assistantId);
    console.log("existing assistant detected");
  } catch (error) {
    // Create new assistant config and write to local file
    // console.error(error);
    console.log("Assistant does not exist. Creating fresh assistant");

    //In the future we can pull this config from a database.
    const assistantConfig: AssistantCreateParams = {
      name: "Managerial Chat Bot",
      instructions: `You are a project managers assistant tasked with gathering the information needed for a project manager.
      to do their job effectively. You will be asked questions about the application and user activities on the application.

      Your main task is to find the information needed to answer the questions asked by the project manager.

      ALWAYS format ALL of your responses in Markdown format. Be sure to provide line breaks in Markdown format.

      ALWAYS use only ONE function call to grab the data you require.

      Provided below is the database schema for the application.
      
      export const user = sqliteTable(
        "user",
        {
          internalId: integer("internalId").primaryKey(),
          userId: text("userId", { length: 256 }).notNull().unique(),
          role: text("role", { length: 256 }).notNull(),
          firstName: text("firstName", { length: 1024 }),
          lastName: text("lastName", { length: 1024 }),
          fullName: text("fullName", { length: 1024 }),
          email: text("email", { length: 256 }).notNull().unique(),
          imageUrl: text("imageUrl", { length: 10000 }),
          createdAt: integer("createdAt").notNull(),
          updatedAt: integer("updatedAt").notNull(),
        },
        (table) => {
          return {
            emailIdx: index("email_idx").on(table.email),
            userIdIdx: index("userId_idx").on(table.userId),
          };
        },
      );
      
      export const workspace = sqliteTable(
        "workspace",
        {
          id: text("id").$defaultFn(createId).primaryKey(),
          name: text("name", { length: 256 }).notNull(),
          slug: text("slug", { length: 256 }).notNull().unique(),
          description: text("description", { length: 512 }).notNull(),
          createdAt: integer("createdAt").notNull(),
          updatedAt: integer("updatedAt").notNull(),
          deletedAt: integer("deletedAt"),
        },
        (table) => {
          return {
            slugIdx: index("slug_idx").on(table.slug),
          };
        },
      );
      export const channel = sqliteTable(
        "channel",
        {
          id: text("id").$defaultFn(createId).primaryKey(),
          slug: text("slug", { length: 256 }).notNull(),
          description: text("description", { length: 512 }).notNull(),
          workspaceId: text("workspaceId").notNull(),
          channelType: text("channelType", { length: 256 }).notNull(),
          createdAt: integer("createdAt").notNull(),
          updatedAt: integer("updatedAt").notNull(),
          deletedAt: integer("deletedAt"),
        },
        (t) => ({
          unq: unique().on(t.workspaceId, t.slug),
        }),
      );
      
      export const workspaceMember = sqliteTable("workspaceMember", {
        id: text("id").$defaultFn(createId).primaryKey(),
        workspaceId: text("workspaceId").notNull(),
        userId: text("userId").notNull(),
        bCanManageChannels: integer("bCanManageChannels").default(0),
        bCanManageWorkspaceMembers: integer("bCanManageWorkspaceMembers").default(0),
        bCanManageWorkspaceSettings: integer("bCanManageWorkspaceSettings").default(
          0,
        ),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const assistantThread = sqliteTable("assistantThread", {
        id: text("id").$defaultFn(createId).primaryKey(),
        userId: text("userId", { length: 256 }).notNull(),
        threadId: text("threadId", { length: 256 }).notNull(),
        preview: text("preview", { length: 256 }).notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
      //Holds all messages sent in the application
      export const message = sqliteTable("message", {
        id: text("id").$defaultFn(createId).primaryKey(),
        channelId: text("channelId").notNull(),
        userId: text("userId").notNull(),
        message: text("message", { length: 60000 }).notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const unSummarizedMessage = sqliteTable("unSummarizedMessage", {
        id: text("id").$defaultFn(createId).primaryKey(),
        messageId: text("messageId").notNull(),
      });
      
      //Summarization of all conversation messages
      export const conversationSummary = sqliteTable("conversationSummary", {
        id: integer("id").primaryKey({ autoIncrement: true }),
        channelId: text("channelId").notNull(),
        conversationId: text("conversationId").notNull(),
        summaryText: text("summaryText", { length: 500 }).notNull(),
        summaryEmbedding: text("summaryEmbedding").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
      //Links all users who participated in a conversation to the conversation summary
      export const conversationSummaryRef = sqliteTable("conversationSummaryRef", {
        id: text("id").$defaultFn(createId).primaryKey(),
        userId: text("userId").notNull(),
        conversationSummaryId: integer("conversationSummaryId").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
      //Messages are grouped by ideas and proximity into conversations
      export const conversation = sqliteTable("conversation", {
        id: text("id").$defaultFn(createId).primaryKey(),
        channelId: text("channelId").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
      //Links Messages with conversations
      export const conversationMessage = sqliteTable("conversationMessage", {
        id: text("id").$defaultFn(createId).primaryKey(),
        messageId: text("messageId").notNull(),
        conversationId: text("conversationId").notNull(),
      });
      
      export const meeting = sqliteTable("meeting", {
        id: text("id").$defaultFn(createId).primaryKey(),
        name: text("name", { length: 256 }).notNull().unique(),
        description: text("description", { length: 512 }).notNull(),
        recurringMeetingId: text("recurringMeetingId"),
        scheduledStartAt: integer("scheduledStartAt").notNull(),
        scheduledEndAt: integer("scheduledEndAt").notNull(),
        startedAt: integer("startedAt"),
        endedAt: integer("endedAt"),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const recurringMeeting = sqliteTable("recurringMeeting", {
        id: text("id").$defaultFn(createId).primaryKey(),
        name: text("name", { length: 256 }).notNull().unique(),
        daysOfWeek: text("daysOfWeek"), // "MONDAY", "TUESDAY", "WEDNESDAY", etc., applicable if weekly. Comma-separated for multiple days.
        scheduledStart: integer("timeOfDay"), // integer from 0 to 2359, applicable if daily
        scheduledDurationInMinutes: integer("durationInMinutes").notNull(),
        until: integer("until"), // Unix timestamp indicating when the recurrence should end
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      //Holds all text messages sent during a meeting
      export const meetingMessage = sqliteTable("meetingMessage", {
        id: text("id").$defaultFn(createId).primaryKey(),
        meetingId: text("meetingId").notNull(),
        userId: text("userId").notNull(),
        message: text("message", { length: 60000 }).notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      //Holds all messages transcribed during a meeting
      export const meetingTranscriptedMessage = sqliteTable(
        "meetingTranscriptedMessage",
        {
          id: text("id").$defaultFn(createId).primaryKey(),
          meetingId: text("meetingId").notNull(),
          userId: text("userId").notNull(),
          message: text("message", { length: 60000 }).notNull(),
          createdAt: integer("createdAt").notNull(),
          updatedAt: integer("updatedAt").notNull(),
          deletedAt: integer("deletedAt"),
        },
      );
      
      //Links users who participated in the meeting to the meeting
      export const meetingMember = sqliteTable("meetingMember", {
        id: text("id").$defaultFn(createId).primaryKey(),
        bIsHost: integer("bIsHost").notNull().default(0),
        bIsRequiredToAttend: integer("bIsRequiredToAttend").notNull().default(1),
        meetingId: text("meetingId").notNull(),
        userId: text("userId").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const insertRecurringMeetingSchema = createInsertSchema(
        recurringMeeting,
        {},
      );
      
      `,
      model: "gpt-4-turbo-preview",
      tools: [
        {
          type: "function",
          function: {
            name: "runDatabaseQuery",
            description: `ALWAYS Use this function to query the database directly. If a user asks you about things related to the application
            and/or user activities on the application use this function to find information in the database and return it to them. 

            ALWAYS use SQLites datetime function to convert unix dates to human readable format.
            For example: Thhe UNIX time "1710869357208" will convert to "Tuesday, March 19, 2024 1:29".
        `,
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: `SQL string to query the database, e.g. "SELECT * FROM table_name;".
                  Assistant must provide this argument to run the function.`,
                },
              },
              required: ["query"],
            },
          },
        },
      ],
    };

    const assistant = await openai.beta.assistants.create(assistantConfig);
    const assistantObj = { assistantId: assistant.id, ...assistantConfig };
    await fs.promises.writeFile(assistantPath, JSON.stringify(assistantObj));
    return assistant;
  }
}
