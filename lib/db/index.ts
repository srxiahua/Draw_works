import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

function resolveDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Vercel 上项目目录只读，改用 /tmp（仍建议配置 Turso 远程库）
  if (process.env.VERCEL) return "file:/tmp/drawworks.db";
  return "file:./data/drawworks.db";
}

function resolveAuthToken() {
  return process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;
}

function ensureDbDir() {
  const url = resolveDbUrl();
  if (url.startsWith("file:")) {
    const relative = url.replace(/^file:/, "");
    const dbPath = path.isAbsolute(relative)
      ? relative
      : path.join(process.cwd(), relative);
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
}

ensureDbDir();

const client = createClient({
  url: resolveDbUrl(),
  authToken: resolveAuthToken(),
});
export const db = drizzle(client, { schema });
