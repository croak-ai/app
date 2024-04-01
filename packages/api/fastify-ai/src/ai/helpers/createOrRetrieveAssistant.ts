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
      about the people or products they manage within a messaging application. This messaging application summarizes
      user messages for easier processing and also holds other relevant information related to messages and conversations.
      Your primary job will be to query an SQL database to find this information. The schema of this database 
      will be given to you.
      
      Communicate this information in a professional and succinct way.
      
      NOTE: Users will provide you with any userIds they wish to query on. For example, In "Can you give me the workspaceId of Ben !(userId = 888)!?" 
      the userId will be enclosed by a starting '!(' and ending ')!'. When responding to messages that include these tags do not
      include the tags and text insid ethe tags in your response. If you do not have enough information to accurately respond to a
      user query, ask them for the information you need.

      NOTE: If somebody asks you something not defined in your duties here respond to the best of
      your ability.

      Provided below is the database schema you will use to construct your queries
      
      CREATE TABLE \`assistantThread\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`userId\` text(256) NOT NULL,
      \`threadId\` text(256) NOT NULL,
      \`preview\` text(256) NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL
      );
      
      //Channels of communication within the application
      CREATE TABLE \`channel\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`slug\` text(256) NOT NULL,
      \`description\` text(512) NOT NULL,
      \`workspaceId\` text NOT NULL,
      \`channelType\` text(256) NOT NULL, //e.g. text, voice
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );
     
      //Messages are grouped by ideas and proximity into conversations
      CREATE TABLE \`conversation\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`channelId\` text NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL
      );
     
      //Links Messages with conversations
      CREATE TABLE \`conversationMessage\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`messageId\` text NOT NULL,     //ID of the message
      \`conversationId\` text NOT NULL //ID of the conversation the message belongs to
      );
     
      //Summarization of all conversation messages
      CREATE TABLE \`conversationSummary\` (
      \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      \`channelId\` text NOT NULL,
      \`conversationId\` text NOT NULL,   //ID of the conversation the summary belongs to
      \`summaryText\` text(500) NOT NULL, //Summary of the conversation
      \`summaryEmbedding\` blob NOT NULL, //Embedding of the summary for use with vector search
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL
      );
     
      //Links all users who participated in a conversation to the conversation summary
      CREATE TABLE \`conversationSummaryRef\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`userId\` text NOT NULL,                   //User who participated in the conversation
      \`conversationSummaryId\` integer NOT NULL, //ID of the conversationSummary
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL
      );
     
      //Meeting information 
      CREATE TABLE \`meeting\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text(256) NOT NULL,
      \`description\` text(512) NOT NULL,
      \`recurringMeetingId\` text,
      \`scheduledStartAt\` integer NOT NULL, //scheduled meeting start time
      \`scheduledEndAt\` integer NOT NULL,   //scheduled meeting end time
      \`startedAt\` integer,                 //Actual meeting start time
      \`endedAt\` integer,                   //Actual meeting end time 
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );
     
      //Links users who participated in the meeting to the meeting
      CREATE TABLE \`meetingMember\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`bIsHost\` integer DEFAULT 0 NOT NULL,
      \`bIsRequiredToAttend\` integer DEFAULT 1 NOT NULL,
      \`meetingId\` text NOT NULL,
      \`userId\` text NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );

      //Holds all text messages sent during a meeting
      CREATE TABLE \`meetingMessage\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`meetingId\` text NOT NULL,
      \`userId\` text NOT NULL,
      \`message\` text(60000) NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );
     
      //Holds all messages transcribed during a meeting
      CREATE TABLE \`meetingTranscriptedMessage\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`meetingId\` text NOT NULL,
      \`userId\` text NOT NULL,
      \`message\` text(60000) NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );
     
      //Holds all messages sent in the application
      CREATE TABLE \`message\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`channelId\` text NOT NULL,
      \`userId\` text NOT NULL,           //User who sent the message
      \`message\` text(60000) NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );
     
      //Holds information specifically about recurring meetings
      CREATE TABLE \`recurringMeeting\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text(256) NOT NULL,
      \`daysOfWeek\` text,
      \`timeOfDay\` integer,
      \`durationInMinutes\` integer NOT NULL,
      \`until\` integer,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );

      //Holds messages that have not yet been suummarized by an AI
      CREATE TABLE \`unSummarizedMessage\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`messageId\` text NOT NULL
      );
     
      //Holds all users in the application
      CREATE TABLE \`user\` (
      \`internalId\` integer PRIMARY KEY NOT NULL,
      \`userId\` text(256) NOT NULL,
      \`role\` text(256) NOT NULL,
      \`firstName\` text(1024),
      \`lastName\` text(1024),
      \`fullName\` text(1024),
      \`email\` text(256) NOT NULL,
      \`imageUrl\` text(10000),
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL
      );
     
      /*
      Holds a list of all workspaces in the application
      Workspaces are a higher form of organization
      Each workspace holds channels within
      */
      CREATE TABLE \`workspace\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text(256) NOT NULL,
      \`slug\` text(256) NOT NULL,
      \`description\` text(512) NOT NULL,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
      );
     
      //Links users to their respective workspaces
      CREATE TABLE \`workspaceMember\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`workspaceId\` text NOT NULL,
      \`userId\` text NOT NULL,
      \`bCanManageChannels\` integer DEFAULT 0,
      \`bCanManageWorkspaceMembers\` integer DEFAULT 0,
      \`bCanManageWorkspaceSettings\` integer DEFAULT 0,
      \`createdAt\` integer NOT NULL,
      \`updatedAt\` integer NOT NULL,
      \`deletedAt\` integer
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
      
      
      CREATE UNIQUE INDEX \`channel_workspaceId_slug_unique\` ON \`channel\` (\`workspaceId\`,\`slug\`);--> statement-breakpoint
      CREATE UNIQUE INDEX \`meeting_name_unique\` ON \`meeting\` (\`name\`);--> statement-breakpoint
      CREATE UNIQUE INDEX \`recurringMeeting_name_unique\` ON \`recurringMeeting\` (\`name\`);--> statement-breakpoint
      CREATE UNIQUE INDEX \`user_userId_unique\` ON \`user\` (\`userId\`);--> statement-breakpoint
      CREATE UNIQUE INDEX \`user_email_unique\` ON \`user\` (\`email\`);--> statement-breakpoint
      CREATE INDEX \`email_idx\` ON \`user\` (\`email\`);--> statement-breakpoint
      CREATE INDEX \`userId_idx\` ON \`user\` (\`userId\`);--> statement-breakpoint
      CREATE UNIQUE INDEX \`workspace_slug_unique\` ON \`workspace\` (\`slug\`);--> statement-breakpoint
      CREATE INDEX \`slug_idx\` ON \`workspace\` (\`slug\`);
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
                  description: `SQL statement, e.g. "SELECT conversationSummary.summaryText
                  FROM conversationSummary
                  INNER JOIN conversationSummaryRef ON conversationSummary.id = conversationSummaryRef.conversationSummaryId
                  WHERE conversationSummaryRef.userId = 'specific_user_id';
                  "`,
                },
              },
              required: ["sql"],
            },
            description: `Use this function to query information in the SQL database. If a user asks you about things related to the application
        and/or user activities on the application use this function to find an answer to their question.`,
          },
        },

        // {
        //   type: "function",
        //   function: {
        //     name: "vectorQuery",
        //     parameters: {
        //       type: "object",
        //       properties: {
        //         sql: {
        //           type: "string",
        //           description: `
        //           Search for the most similar rows in the database to a given embedding.
        //           select rowid, distance  from vss_summaries
        //           where vss_search( summary_embedding, ?)
        //           limit 10;`,
        //         },
        //         // embedding: {
        //         //   type: "string",
        //         //   description: `SQL statement, e.g. "SELECT CustomerName, City FROM Customers;"`,
        //         // },
        //       },
        //       required: ["sql"],
        //     },
        //     description: `Query information only available by vector search in the SQL database.
        //     I.E. If a user asks you "What was Nick up to yesterday?" `,
        //   },
        // },
      ],
    };
    //gpt-3.5-turbo-1106
    const assistant = await openai.beta.assistants.create(assistantConfig);
    const assistantObj = { assistantId: assistant.id, ...assistantConfig };
    await fs.promises.writeFile(assistantPath, JSON.stringify(assistantObj));
    return assistant;
  }
}
