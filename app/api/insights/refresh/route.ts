import { NextResponse } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { refreshUserInsights } from "@/lib/ai/jobs";

export async function POST() {
  try {
    const userId = await getOwnerUserId();
    const insights = await refreshUserInsights(userId);
    return NextResponse.json({ ok: true, insights });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "生成失败";
    const message =
      raw.includes("Failed query") || raw.includes("SQLITE")
        ? "数据库写入失败。Vercel 生产环境请配置 Turso（DATABASE_URL + TURSO_AUTH_TOKEN），详见 README。"
        : raw;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
