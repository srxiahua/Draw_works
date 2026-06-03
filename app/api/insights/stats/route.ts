import { NextResponse } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { getUserAnalysisStats } from "@/lib/db/queries";
import { getAnalysisModeLabel } from "@/lib/ai";

export async function GET() {
  const userId = await getOwnerUserId();
  const stats = await getUserAnalysisStats(userId);
  return NextResponse.json({
    stats,
    analysisMode: getAnalysisModeLabel(),
  });
}
