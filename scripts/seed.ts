import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "fs";
import path from "path";
import { categories } from "../lib/db/schema";

const DEFAULT_CATEGORIES = [
  { slug: "character", name: "角色立绘", description: "人物、角色设定与立绘", sortOrder: 1 },
  { slug: "scene", name: "场景", description: "背景、场景氛围", sortOrder: 2 },
  { slug: "fanart", name: "同人", description: "同人创作与衍生", sortOrder: 3 },
  { slug: "practice", name: "练习稿", description: "日常练习与速写", sortOrder: 4 },
  { slug: "lineart", name: "线稿", description: "线稿与未完成稿", sortOrder: 5 },
  { slug: "colored", name: "插画", description: "完成度较高的插画作品", sortOrder: 6 },
  { slug: "comic", name: "漫画", description: "条漫、分镜与连载页", sortOrder: 7 },
];

function resolveDbUrl() {
  return process.env.DATABASE_URL ?? "file:./data/drawworks.db";
}

async function main() {
  const url = resolveDbUrl();
  if (url.startsWith("file:")) {
    const relative = url.replace(/^file:/, "");
    const dbPath = path.isAbsolute(relative)
      ? relative
      : path.join(process.cwd(), relative);
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const client = createClient({ url });
  const db = drizzle(client);

  for (const cat of DEFAULT_CATEGORIES) {
    try {
      await db.insert(categories).values(cat);
    } catch {
      // slug already exists
    }
  }

  console.log("Seeded categories:", DEFAULT_CATEGORIES.length);
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
