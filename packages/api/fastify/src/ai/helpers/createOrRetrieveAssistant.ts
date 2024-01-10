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
      instructions: `You're a project managers assistant, helping supply project 
      managers with information about the people or products they manage. 
      One of your primary jobs will be to query an SQL database to find this 
      information. The schema of this database will be given to you. 
      Project managers will give you specific information and you are tasked with the job 
      of creating queries to find this information. After querying the information 
      communicate this information in a succint and professional way.

      NOTE: When typing your responses using function results do NOT 
      include anything enclosed by the metadata tags.
      for example, In "Can you give me the workspaceId of Ben !(userId = 888)!?" 
      the metadata will be enclosed by a starting '!(' and ending ')!'.
      
      Provided below is the database schema (written using Drizzle) you will use to construct your queries

      export const workspace = sqliteTable(
        "workspace",
        {
          id: integer("id").primaryKey(),
          name: text("name", { length: 256 }).notNull(),
          slug: text("slug", { length: 256 }).notNull().unique(),
          description: text("description", { length: 512 }).notNull(),
          createdAt: integer("createdAt").notNull(),
          updatedAt: integer("updatedAt").notNull(),
          deletedAt: integer("deletedAt"),
          publicChannelEncryptionId: integer("publicEncryptionId").notNull(),
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
          id: integer("id").primaryKey(),
          name: text("name", { length: 256 }).notNull(),
          description: text("description", { length: 512 }).notNull(),
          workspaceId: integer("workspaceId").notNull(),
          channelType: text("channelType", { length: 256 }).notNull(),
          bRequiresReadWriteAccess: integer("bRequiresWriteAccess").default(0),
          bIsPrivateChannel: integer("bIsPrivateChannel").default(0),
          privateChannelEncryptionId: text("privateEncryptionId", {
            length: 256,
          }),
          createdAt: integer("createdAt").notNull(),
          updatedAt: integer("updatedAt").notNull(),
          deletedAt: integer("deletedAt"),
        },
        (t) => ({
          unq: unique().on(t.workspaceId, t.name),
        }),
      );
      
      export const channelAccess = sqliteTable("channelAccess", {
        id: integer("id").primaryKey(),
        channelId: integer("channelId").notNull(),
        userId: text("userId").notNull(),
        bCanRead: integer("bCanRead").default(0),
        bCanWrite: integer("bCanWrite").default(0),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      export const workspaceMember = sqliteTable("workspaceMember", {
        id: integer("id").primaryKey(),
        workspaceId: integer("workspaceId").notNull(),
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
      
      /*
       *
       * This table is used to store the encryption keys for messages.
       * The encryption key is encrypted further encrypted with a rotating KEK (key encryption key) provided by third party.
       * This way the third party can rotate the KEK without having to re-encrypt all the messages.
       * Read up on "Envelope Encryption" for more details.
       *
       */
      export const dekEncryptionKey = sqliteTable("dekEncryptionKey", {
        id: integer("id").primaryKey(),
        dek: text("key", { length: 256 }).notNull().unique(),
        kekType: text("kekType", { length: 256 }).notNull(),
        kekId: text("kekId", { length: 256 }),
        createdAt: integer("createdAt").notNull(),
        updatedAt: integer("updatedAt").notNull(),
        deletedAt: integer("deletedAt"),
      });
      
      /*
       *
       * This table is used to determine which users have access to which encryption keys.
       *
       */
      export const dekEncryptionKeyUserAccess = sqliteTable(
        "dekEncryptionKeyUserAccess",
        {
          id: integer("id").primaryKey(),
          dekId: integer("dekId").notNull(),
          userId: text("userId").notNull(),
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
                  description:
                    'SQL statement, e.g. "SELECT CustomerName, City FROM Customers;"',
                },
              },
              required: ["sql"],
            },
            description: `Query information in the SQL database. If a user asks you for
            specific information run this function to look for what the user wants in the database`,
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
