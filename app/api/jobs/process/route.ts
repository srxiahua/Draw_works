import { NextResponse } from "next/server";
import { processPendingJobs } from "@/lib/ai/jobs";

/** 手动触发待处理分析任务 */
export async function POST() {
  await processPendingJobs(10);
  return NextResponse.json({ ok: true });
}
