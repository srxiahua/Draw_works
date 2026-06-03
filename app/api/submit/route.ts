import { NextResponse } from "next/server";
import { after } from "next/server";
import { getOwnerUserId } from "@/lib/owner";
import { db } from "@/lib/db";
import { artworks } from "@/lib/db/schema";
import {
  guessTitle,
  processAndStoreImage,
  processTextSubmission,
  processUrlSubmission,
} from "@/lib/upload";
import { enqueueAnalysisJob, processArtworkAnalysis } from "@/lib/ai/jobs";

async function finalizeArtwork(
  artworkId: string,
  data: {
    userId: string;
    title: string;
    note?: string;
    inputType: "image" | "url" | "text";
    sourceUrl?: string;
    textDescription?: string;
    storageKey: string;
    thumbKey: string;
    mimeType: string;
    fileSize: number;
  }
) {
  const [artwork] = await db
    .insert(artworks)
    .values({
      id: artworkId,
      userId: data.userId,
      title: data.title,
      note: data.note,
      inputType: data.inputType,
      sourceUrl: data.sourceUrl,
      textDescription: data.textDescription,
      storageKey: data.storageKey,
      thumbKey: data.thumbKey,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      status: "pending",
    })
    .returning();

  await enqueueAnalysisJob(artwork.id);
  after(async () => {
    try {
      await processArtworkAnalysis(artwork.id);
    } catch (e) {
      console.error("Analysis failed for", artwork.id, e);
    }
  });

  return artwork;
}

/** 统一投递：图片 / 链接 / 文字 */
export async function POST(request: Request) {
  const userId = await getOwnerUserId();
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    const note = (formData.get("note") as string) || undefined;
    if (files.length === 0) {
      return NextResponse.json({ error: "请选择图片" }, { status: 400 });
    }

    const created = [];
    for (const file of files) {
      const stored = await processAndStoreImage(file, userId);
      const artwork = await finalizeArtwork(stored.artworkId, {
        userId,
        title: guessTitle(file.name),
        note,
        inputType: "image",
        ...stored,
      });
      created.push({ id: artwork.id, title: artwork.title, status: artwork.status });
    }
    return NextResponse.json({ artworks: created }, { status: 202 });
  }

  const body = await request.json();
  const type = body.type as string;
  const note = body.note as string | undefined;

  if (type === "url") {
    const url = body.url as string;
    if (!url?.trim()) {
      return NextResponse.json({ error: "请填写图片链接" }, { status: 400 });
    }
    try {
      const stored = await processUrlSubmission(url.trim(), userId);
      const title = (body.title as string) || guessTitle(new URL(url).pathname) || "链接作品";
      const artwork = await finalizeArtwork(stored.artworkId, {
        userId,
        title,
        note,
        inputType: "url",
        sourceUrl: url.trim(),
        storageKey: stored.storageKey,
        thumbKey: stored.thumbKey,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
      });
      return NextResponse.json(
        { artworks: [{ id: artwork.id, title: artwork.title, status: artwork.status }] },
        { status: 202 }
      );
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "链接抓取失败" },
        { status: 400 }
      );
    }
  }

  if (type === "text") {
    const title = (body.title as string)?.trim() || "文字构思";
    const description = (body.description as string)?.trim();
    if (!description || description.length < 10) {
      return NextResponse.json({ error: "文字描述至少 10 字" }, { status: 400 });
    }
    try {
      const stored = await processTextSubmission(title, description, userId);
      const artwork = await finalizeArtwork(stored.artworkId, {
        userId,
        title,
        note: note ?? description,
        inputType: "text",
        textDescription: description,
        storageKey: stored.storageKey,
        thumbKey: stored.thumbKey,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
      });
      return NextResponse.json(
        { artworks: [{ id: artwork.id, title: artwork.title, status: artwork.status }] },
        { status: 202 }
      );
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "创建失败" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ error: "未知投递类型" }, { status: 400 });
}
