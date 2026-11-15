import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const mycamplyProgressTable = pgTable("mycamply_progress_v2", {
  keyHash: text("key_hash").primaryKey(),
  state: jsonb("state").notNull(),
  revision: text("revision").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
