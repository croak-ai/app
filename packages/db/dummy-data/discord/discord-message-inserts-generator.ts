import fs from "fs";
import path from "path";

interface DiscordData {
  guild: {
    id: string;
    name: string;
    iconUrl: string;
  };
  channel: {
    id: string;
    type: string;
    categoryId: string;
    category: string;
    name: string;
    topic: string | null;
  };
  dateRange: {
    after: string | null;
    before: string | null;
  };
  exportedAt: string;
  messages: Array<{
    id: string;
    type: string;
    timestamp: string;
    timestampEdited: string | null;
    callEndedTimestamp: string | null;
    isPinned: boolean;
    content: string;
    author: {
      id: string;
      name: string;
      discriminator: string;
      nickname: string | null;
      color: string;
      isBot: boolean;
      roles: Array<{
        id: string;
        name: string;
        color: string;
        position: number;
      }>;
      avatarUrl: string;
    };
    attachments: Array<{
      id: string;
      url: string;
      fileName: string;
      fileSizeBytes: number;
    }>;
    embeds: Array<{}>;
    stickers: Array<{}>;
    reactions: Array<{}>;
    mentions: Array<{}>;
  }>;
  messageCount: number;
}

const generateInserts = (discordData: DiscordData) => {
  const inserts = discordData.messages
    .map((message) => {
      const timestamp = new Date(message.timestamp).getTime();
      // Escape single quotes by replacing them with two single quotes
      const escapedContent = message.content.replace(/'/g, "''");
      // Escape new lines by replacing them with \n
      const newLineEscapedContent = escapedContent.replace(/\n/g, "\\n");
      // Escape double quotes by wrapping the entire string with double quotes and using two double quotes to represent a double quote inside the string
      const safeContent = newLineEscapedContent.replace(/"/g, '""');
      return `INSERT INTO message (id, channelId, userId, message, createdAt, updatedAt) VALUES ('${message.id}', '${discordData.channel.id}', '${message.author.id}', '${safeContent}', ${timestamp}, ${timestamp});`;
    })
    .join("\n");

  return inserts;
};

const discordDataPath = path.join(__dirname, "discord-data.json");
const discordData: DiscordData = JSON.parse(
  fs.readFileSync(discordDataPath, "utf8"),
);

const inserts = generateInserts(discordData);

const insertsFilePath = path.join(__dirname, "inserts.sql");
fs.writeFileSync(insertsFilePath, inserts);

console.log(`Generated inserts.sql file at ${insertsFilePath}`);
