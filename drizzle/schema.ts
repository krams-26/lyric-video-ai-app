import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table: stores user's music transformation projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  originalAudioUrl: text("originalAudioUrl").notNull(), // S3 URL
  transformedAudioUrl: text("transformedAudioUrl"), // S3 URL after style transfer
  videoUrl: text("videoUrl"), // S3 URL of final video
  musicStyle: varchar("musicStyle", { length: 50 }).notNull(), // Orchestra, Jazz, Rock, EDM, Lo-fi, Classical
  backgroundTheme: varchar("backgroundTheme", { length: 50 }).default("dark").notNull(),
  status: mysqlEnum("status", ["uploading", "processing", "completed", "failed"]).default("uploading").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Lyrics table: stores transcribed lyrics with timestamps
 */
export const lyrics = mysqlTable("lyrics", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id),
  content: text("content").notNull(), // Full lyrics text
  lyricsJson: text("lyricsJson").notNull(), // JSON array of {text, startTime, endTime}
  isEdited: int("isEdited").default(0).notNull(), // Boolean flag for manual edits
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lyric = typeof lyrics.$inferSelect;
export type InsertLyric = typeof lyrics.$inferInsert;

/**
 * Processing jobs table: tracks async tasks in the queue
 */
export const processingJobs = mysqlTable("processingJobs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id),
  jobType: mysqlEnum("jobType", ["style_transfer", "transcription", "video_render"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type InsertProcessingJob = typeof processingJobs.$inferInsert;