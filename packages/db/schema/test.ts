import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const test = sqliteTable("test", {
  id: integer("id").primaryKey(),
  title: text("name", { length: 256 }).notNull(),
  content: text("content", { length: 256 }).notNull(),
});
