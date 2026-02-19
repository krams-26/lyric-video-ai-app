import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, lyrics, processingJobs, InsertProject, InsertLyric, InsertProcessingJob } from "../drizzle/schema";
import { ENV } from './_core/env';

import type { Project, Lyric, ProcessingJob } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Project queries
 */
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  // Return the inserted project with ID
  const insertedProject = await db.select().from(projects).where(eq(projects.userId, data.userId)).orderBy((t) => t.id).limit(1);
  return insertedProject[0] || result;
}

export async function updateProject(projectId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(projects).set(data).where(eq(projects.id, projectId));
}

/**
 * Lyrics queries
 */
export async function getLyricsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lyrics).where(eq(lyrics.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLyrics(data: InsertLyric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(lyrics).values(data);
}

export async function updateLyrics(lyricsId: number, data: Partial<InsertLyric>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lyrics).set(data).where(eq(lyrics.id, lyricsId));
  return db.select().from(lyrics).where(eq(lyrics.id, lyricsId)).limit(1).then(r => r[0]);
}

/**
 * Processing jobs queries
 */
export async function createProcessingJob(data: InsertProcessingJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(processingJobs).values(data);
}

export async function getProcessingJobsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(processingJobs).where(eq(processingJobs.projectId, projectId));
}

export async function updateProcessingJob(jobId: number, data: Partial<InsertProcessingJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(processingJobs).set(data).where(eq(processingJobs.id, jobId));
}

export async function getPendingJobs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(processingJobs).where(eq(processingJobs.status, "pending")).limit(10);
}

export async function deleteLyrics(lyricsId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(lyrics).where(eq(lyrics.id, lyricsId));
}
