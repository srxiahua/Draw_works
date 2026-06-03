import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

function resolveDbUrl() {
  return process.env.DATABASE_URL ?? "file:./data/drawworks.db";
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

const client = createClient({ url: resolveDbUrl() });
export const db = drizzle(client, { schema });
