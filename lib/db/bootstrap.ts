import { sql, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

let schemaReady: Promise<void> | null = null;

/** Serverless 冷启动时确保 SQLite 表存在（/tmp 库或无迁移的远程库） */
export function ensureDbSchema() {
  if (!schemaReady) {
    schemaReady = bootstrapSchema().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}

async function exec(statement: ReturnType<typeof sql>) {
  await db.run(statement);
}

async function bootstrapSchema() {
  await exec(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      bio TEXT,
      created_at INTEGER NOT NULL
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS artworks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT,
      title TEXT NOT NULL DEFAULT '未命名作品',
      note TEXT,
      storage_key TEXT NOT NULL,
      thumb_key TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      is_public INTEGER NOT NULL DEFAULT 0,
      public_summary TEXT,
      input_type TEXT NOT NULL DEFAULT 'image',
      source_url TEXT,
      text_description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS artwork_tags (
      artwork_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (artwork_id, tag_id)
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS artwork_analyses (
      id TEXT PRIMARY KEY,
      artwork_id TEXT NOT NULL UNIQUE,
      vision_result TEXT NOT NULL,
      summary_zh TEXT NOT NULL,
      subjects TEXT NOT NULL,
      techniques TEXT NOT NULL,
      style_keywords TEXT NOT NULL,
      mood TEXT,
      color_palette TEXT,
      composition TEXT,
      skill_level_estimate TEXT,
      confidence REAL,
      created_at INTEGER NOT NULL
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS analysis_jobs (
      id TEXT PRIMARY KEY,
      artwork_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS style_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      aggregated_traits TEXT NOT NULL,
      radar_scores TEXT,
      updated_at INTEGER NOT NULL
    )
  `);
  await exec(sql`
    CREATE TABLE IF NOT EXISTS growth_advices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      focus_areas TEXT NOT NULL,
      exercises TEXT NOT NULL,
      "references" TEXT NOT NULL,
      generated_at INTEGER NOT NULL
    )
  `);

  const cats = [
    ["character", "角色立绘", "人物、角色设定与立绘", 1],
    ["scene", "场景", "背景、场景氛围", 2],
    ["fanart", "同人", "同人创作与衍生", 3],
    ["practice", "练习稿", "日常练习与速写", 4],
    ["lineart", "线稿", "线稿与未完成稿", 5],
    ["colored", "插画", "完成度较高的插画作品", 6],
    ["comic", "漫画", "条漫、分镜与连载页", 7],
  ] as const;

  for (const [slug, name, desc, order] of cats) {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (!existing) {
      await db.insert(categories).values({
        id: randomUUID(),
        slug,
        name,
        description: desc,
        sortOrder: order,
      });
    }
  }
}
