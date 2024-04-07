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
      instructions: `
      You are an assistant for an app called "croak". Croak is just like Slack, users message and chat with each other.

      You will be asked questions from users on croak. You will need to find the information needed to answer the questions asked by the user.

      You have access to the entire database of croak, including all messages, channels, users, and workspaces.

      If you can't answer the question ask the user for more information needed to answer the question. Or simply say "I don't know".

      Always format ALL of your responses in Markdown format. Be sure to provide line breaks in Markdown format.

      `,
      model: "gpt-4-turbo-preview",
      tools: [
        {
          type: "function",
          function: {
            name: "runDatabaseQuery",
            description: `ALWAYS Use this function to query the database directly. If a user asks you about things related to the application
            and/or user activities on the application use this function to find information in the database and return it to them. 

            Sometimes you may not know exactly how to write the query, in this case try your best by searching through data that might have what the user is asking for.
            Typically, this looks like searching through messages, but using joins to narrow down the messages to query for.

            In the database, dates are stored in UNIX epoch in milliseconds, however strftime gets UNIX epoch in seconds so you will need to multiply by 1000. For example: (strftime('%s', 'now') + 0) * 1000;
            Also, if the user asks for a date the query needs to be in a range, so you will need two where clauses for every SQL query that interacts with dates.

            Be extremely generous with the queries. We allow a limit of 10000 rows. However, if you think the query doesn't need it you can lower the limit.

            Database Schema:

                  
            CREATE TABLE "channel" (
              "id" text PRIMARY KEY NOT NULL,
              "slug" text(256) NOT NULL,
              "description" text(512) NOT NULL,
              "workspaceId" text NOT NULL,
              "channelType" text(256) NOT NULL,
              "createdAt" integer NOT NULL,
              "updatedAt" integer NOT NULL,
              "deletedAt" integer
            );
            
            CREATE TABLE "message" (
              "id" text PRIMARY KEY NOT NULL,
              "channelId" text NOT NULL,
              "userId" text NOT NULL,
              "message" text(60000) NOT NULL,
              "createdAt" integer NOT NULL,
              "updatedAt" integer NOT NULL,
              "deletedAt" integer
            );
            
            CREATE TABLE "user" (
              "internalId" integer PRIMARY KEY NOT NULL,
              "userId" text(256) NOT NULL,
              "role" text(256) NOT NULL,
              "firstName" text(1024),
              "lastName" text(1024),
              "fullName" text(1024),
              "email" text(256) NOT NULL,
              "imageUrl" text(10000),
              "lastKnownStatus" text,
              "lastKnownStatusConfirmedAt" integer,
              "lastKnownStatusSwitchedAt" integer,
              "createdAt" integer NOT NULL,
              "updatedAt" integer NOT NULL
            );
            
            CREATE TABLE "workspace" (
              "id" text PRIMARY KEY NOT NULL,
              "name" text(256) NOT NULL,
              "slug" text(256) NOT NULL,
              "description" text(512) NOT NULL,
              "createdAt" integer NOT NULL,
              "updatedAt" integer NOT NULL,
              "deletedAt" integer
            );
            
            CREATE TABLE "workspaceMember" (
              "id" text PRIMARY KEY NOT NULL,
              "workspaceId" text NOT NULL,
              "userId" text NOT NULL,
              "bCanManageChannels" integer DEFAULT 0,
              "bCanManageWorkspaceMembers" integer DEFAULT 0,
              "bCanManageWorkspaceSettings" integer DEFAULT 0,
              "createdAt" integer NOT NULL,
              "updatedAt" integer NOT NULL,
              "deletedAt" integer
            );
            
            
            CREATE VIRTUAL TABLE user_fts USING fts5(firstName, lastName, fullName, email, content="user", content_rowid="internalId");
            
            
            CREATE TRIGGER user_ai AFTER INSERT ON user BEGIN
                INSERT INTO user_fts(rowid, firstName, lastName, fullName, email) VALUES (new.internalId, new.firstName, new.lastName, new.fullName, new.email);
            END;    
            
            
            CREATE TRIGGER user_ad AFTER DELETE ON user BEGIN
                INSERT INTO user_fts(user_fts, rowid, firstName, lastName, fullName, email) VALUES('delete', old.internalId, old.firstName, old.lastName, old.fullName, old.email);
            END;
            
            
            CREATE TRIGGER user_au AFTER UPDATE ON user BEGIN
                INSERT INTO user_fts(user_fts, rowid, firstName, lastName, fullName, email) VALUES('delete', old.internalId, old.firstName, old.lastName, old.fullName, old.email);
                INSERT INTO user_fts(rowid, firstName, lastName, fullName, email) VALUES (new.internalId, new.firstName, new.lastName, new.fullName, new.email);
            END;
            
            
            
            create virtual table vss_summaries using vss0(
              summary_embedding(384),
            );
            
            
            
            CREATE UNIQUE INDEX "channel_workspaceId_slug_unique" ON "channel" ("workspaceId","slug");
            CREATE UNIQUE INDEX "meeting_name_unique" ON "meeting" ("name");
            CREATE UNIQUE INDEX "recurringMeeting_name_unique" ON "recurringMeeting" ("name");
            CREATE UNIQUE INDEX "user_userId_unique" ON "user" ("userId");
            CREATE UNIQUE INDEX "user_email_unique" ON "user" ("email");
            CREATE INDEX "email_idx" ON "user" ("email");
            CREATE INDEX "userId_idx" ON "user" ("userId");
            CREATE UNIQUE INDEX "workspace_slug_unique" ON "workspace" ("slug");
            CREATE INDEX "slug_idx" ON "workspace" ("slug");
            
            CREATE TABLE "test" (
              "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
              "name" text(256) NOT NULL
            );
            
            
            DROP TABLE "test";
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
