import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const DEFAULT_OWNER_EMAIL = "owner@local.drawworks";
const DEFAULT_OWNER_NAME = "创作者";

/** 单人站点：自动获取或创建唯一本地用户，无需登录 */
export async function getOwnerUser() {
  const email = process.env.OWNER_EMAIL ?? DEFAULT_OWNER_EMAIL;
  const name = process.env.OWNER_NAME ?? DEFAULT_OWNER_NAME;

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    [user] = await db.insert(users).values({ email, name }).returning();
  }

  return user;
}

export async function getOwnerUserId() {
  const user = await getOwnerUser();
  return user.id;
}
