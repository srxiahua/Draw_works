import { NextResponse } from "next/server";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { getOwnerUserId } from "@/lib/owner";
import { db } from "@/lib/db";
import { artworks } from "@/lib/db/schema";
import { enqueueAnalysisJob, processArtworkAnalysis } from "@/lib/ai/jobs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getOwnerUserId();
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(artworks)
    .where(eq(artworks.id, id))
    .limit(1);

  if (!existing || existing.userId !== ownerId) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }

  await db
    .update(artworks)
    .set({ status: "pending", updatedAt: new Date() })
    .where(eq(artworks.id, id));

  await enqueueAnalysisJob(id);

  after(async () => {
    try {
      await processArtworkAnalysis(id);
    } catch (e) {
      console.error("Re-analysis failed", id, e);
    }
  });

  return NextResponse.json({ ok: true, status: "pending" });
}
