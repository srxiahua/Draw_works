import { NextResponse } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { refreshUserInsights } from "@/lib/ai/jobs";

export async function POST() {
  try {
    const userId = await getOwnerUserId();
    const insights = await refreshUserInsights(userId);
    return NextResponse.json({ ok: true, insights });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
