import { NextResponse } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { reanalyzeAllForUser } from "@/lib/ai/jobs";

export async function POST() {
  const userId = await getOwnerUserId();
  const count = await reanalyzeAllForUser(userId);
  return NextResponse.json({ ok: true, count });
}
