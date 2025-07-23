import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("developer"), // developer, sre, manager
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(), // github, confluence, jira, slack, upload
  sourceUrl: text("source_url"),
  metadata: jsonb("metadata"), // tags, author, etc.
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  sources: jsonb("sources"), // array of source references
  createdAt: timestamp("created_at").defaultNow(),
});

export const vectorEmbeddings = pgTable("vector_embeddings", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  chunkIndex: integer("chunk_index").notNull(),
  chunkContent: text("chunk_content").notNull(),
  embedding: text("embedding").notNull(), // serialized vector
  metadata: jsonb("metadata"),
});

export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // github, confluence, jira, slack
  config: jsonb("config"), // connection settings
  lastSync: timestamp("last_sync"),
  status: text("status").notNull().default("active"), // active, error, syncing
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  sourceType: true,
  sourceUrl: true,
  metadata: true,
  uploadedBy: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  title: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
  sources: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).pick({
  name: true,
  type: true,
  config: true,
  status: true,
});

// Query schemas
export const querySchema = z.object({
  query: z.string().min(1),
  conversationId: z.number().optional(),
  filters: z.object({
    dateRange: z.string().optional(),
    sourceTypes: z.array(z.string()).optional(),
    teams: z.array(z.string()).optional(),
  }).optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DataSource = typeof dataSources.$inferSelect;

export type Query = z.infer<typeof querySchema>;

export type VectorEmbedding = typeof vectorEmbeddings.$inferSelect;
