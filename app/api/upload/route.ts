import { NextResponse } from "next/server";
import { after } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { db } from "@/lib/db";
import { artworks, analysisJobs } from "@/lib/db/schema";
import { guessTitle, processAndStoreImage } from "@/lib/upload";
import { enqueueAnalysisJob, processArtworkAnalysis } from "@/lib/ai/jobs";

export async function POST(request: Request) {
  const userId = await getOwnerUserId();

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const note = (formData.get("note") as string) || undefined;

  if (files.length === 0) {
    return NextResponse.json({ error: "请选择图片" }, { status: 400 });
  }

  const created: { id: string; title: string; status: string }[] = [];

  for (const file of files) {
    try {
      const stored = await processAndStoreImage(file, userId);
      const title = guessTitle(file.name);

      const [artwork] = await db
        .insert(artworks)
        .values({
          id: stored.artworkId,
          userId,
          title,
          note,
          inputType: "image",
          storageKey: stored.storageKey,
          thumbKey: stored.thumbKey,
          mimeType: stored.mimeType,
          fileSize: stored.fileSize,
          status: "pending",
        })
        .returning();

      await enqueueAnalysisJob(artwork.id);
      created.push({
        id: artwork.id,
        title: artwork.title,
        status: artwork.status,
      });

      const artworkId = artwork.id;
      after(async () => {
        try {
          await processArtworkAnalysis(artworkId);
        } catch (e) {
          console.error("Analysis failed for", artworkId, e);
        }
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "上传失败";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ artworks: created }, { status: 202 });
}
