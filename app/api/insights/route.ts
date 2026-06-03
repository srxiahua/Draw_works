import { NextResponse } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { getUserInsights } from "@/lib/db/queries";

export async function GET() {
  const userId = await getOwnerUserId();
  const data = await getUserInsights(userId);
  return NextResponse.json(data);
}
