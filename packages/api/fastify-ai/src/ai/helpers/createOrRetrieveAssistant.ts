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
    console.log("existing assistant detected");

    return await openai.beta.assistants.retrieve(assistantId);
  } catch (error) {
    // Create new assistant config and write to local file
    // console.error(error);
    console.log("Assistant does not exist. Creating fresh assistant");

    //In the future we can pull this config from a database.
    const assistantConfig: AssistantCreateParams = {
      name: "Managerial Chat Bot",
      instructions: `You're a project managers assistant, helping supply project managers with information 
      about the people or products they manage. One of your primary jobs will be to query an 
      SQL database to find this information. The schema of this database will be given to you. 
      Project managers will give you specific information they want and you are tasked with the job 
      of creating queries to find this information. After querying the information 
      communicate this information in a succinct and professional way.
      
      NOTE: When typing your responses using function results do NOT include anything enclosed 
      by the metadata tags. For example, In "Can you give me the workspaceId of Ben !(userId = 888)!?" 
      the metadata will be enclosed by a starting '!(' and ending ')!'.

      NOTE: If somebody asks you something not defined in your duties here respond to the best of
      your ability.
      
      Provided below is the database schema (written using Drizzle) you will use to construct your queries
      
      export const user = sqliteTable("user", {
        userId: text("userId", { length: 256 }).primaryKey(),
        role: text("role", { length: 256 }).notNull(),
        firstName: text("firstName", { length: 256 }),
        lastName: text("lastName", { length: 256 }),
        email: text("email", { length: 256 }).notNull().unique(),
        imageUrl: text("imageUrl", { length: 10000 }),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
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
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
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
      
      export const conversationSummary = sqliteTable("conversationSummary", {
        id: integer("id").primaryKey({ autoIncrement: true }),
        channelId: text("channelId").notNull(),
        conversationId: text("conversationId").notNull(),
        summaryText: text("summaryText", { length: 500 }).notNull(),
        summaryEmbedding: blob("summaryEmbedding").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
      export const conversationSummaryRef = sqliteTable("conversationSummaryRef", {
        id: text("id").$defaultFn(createId).primaryKey(),
        userId: text("userId").notNull(),
        conversationSummaryId: integer("conversationSummaryId").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
      export const conversation = sqliteTable("conversation", {
        id: text("id").$defaultFn(createId).primaryKey(),
        channelId: text("channelId").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
      });
      
      export const conversationMessage = sqliteTable("conversationMessage", {
        id: text("id").$defaultFn(createId).primaryKey(),
        messageId: text("messageId").notNull(),
        conversationId: text("conversationId").notNull(),
      });
      
      export const testTable = sqliteTable("testTable", {
        id: text("id").$defaultFn(createId).primaryKey(),
      });
      
      export const meeting = sqliteTable("meeting", {
        id: text("id").$defaultFn(createId).primaryKey(),
        recurringMeetingId: text("recurringMeetingId"),
        scheduledAt: integer("scheduledAt").notNull(),
        startedAt: integer("startedAt"),
        endedAt: integer("endedAt"),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const recurringMeeting = sqliteTable("recurringMeeting", {
        id: text("id").$defaultFn(createId).primaryKey(),
        frequency: text("frequency", { length: 256 }).notNull(),
        interval: integer("interval").notNull(),
        count: integer("count"),
        until: integer("until"),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const meetingParticipant = sqliteTable("meetingParticipant", {
        id: text("id").$defaultFn(createId).primaryKey(),
        meetingId: text("meetingId").notNull(),
        userId: text("userId").notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const meetingMessage = sqliteTable("meetingMessage", {
        id: text("id").$defaultFn(createId).primaryKey(),
        meetingId: text("meetingId").notNull(),
        userId: text("userId").notNull(),
        message: text("message", { length: 60000 }).notNull(),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
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
      `,
      model: "gpt-4",
      tools: [
        {
          type: "function",
          function: {
            name: "query",
            parameters: {
              type: "object",
              properties: {
                sql: {
                  type: "string",
                  description: `SQL statement, e.g. "SELECT CustomerName, City FROM Customers;"`,
                },
              },
              required: ["sql"],
            },
            description: `Query information in the SQL database. If a user asks you for
            specific information run this function to look for what the user wants in the database.`,
          },
        },

        {
          type: "function",
          function: {
            name: "vectorQuery",
            parameters: {
              type: "object",
              properties: {
                sql: {
                  type: "string",
                  description: `
                  Search for the most similar rows in the database to a given embedding.
                  select rowid, distance  from vss_summaries
                  where vss_search( summary_embedding, ?)
                  limit 10;`,
                },
                // embedding: {
                //   type: "string",
                //   description: `SQL statement, e.g. "SELECT CustomerName, City FROM Customers;"`,
                // },
              },
              required: ["sql"],
            },
            description: `Query information in the SQL database based on a given embedding.`,
          },
        },
      ],
    };
    //gpt-3.5-turbo-1106
    const assistant = await openai.beta.assistants.create(assistantConfig);
    const assistantObj = { assistantId: assistant.id, ...assistantConfig };
    await fs.promises.writeFile(assistantPath, JSON.stringify(assistantObj));
    return assistant;
  }
}
