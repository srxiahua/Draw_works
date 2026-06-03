import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  artworks,
  artworkAnalyses,
  artworkTags,
  analysisJobs,
  tags,
  categories,
  styleProfiles,
  growthAdvices,
} from "@/lib/db/schema";
import { getVisionProvider } from "@/lib/ai";
import { getStorage } from "@/lib/storage";

const MAX_ATTEMPTS = 3;

async function loadArtworkImage(artwork: {
  thumbKey: string;
  storageKey: string;
  mimeType: string;
}) {
  const storage = getStorage();
  let buffer = await storage.read(artwork.thumbKey);
  if (!buffer) buffer = await storage.read(artwork.storageKey);
  if (!buffer) throw new Error("无法读取作品图片文件");
  return {
    imageBuffer: buffer,
    mimeType: artwork.thumbKey.endsWith(".webp") ? "image/webp" : artwork.mimeType,
  };
}

export async function processArtworkAnalysis(artworkId: string) {
  const [artwork] = await db
    .select()
    .from(artworks)
    .where(eq(artworks.id, artworkId))
    .limit(1);

  if (!artwork) return;

  const [job] = await db
    .select()
    .from(analysisJobs)
    .where(eq(analysisJobs.artworkId, artworkId))
    .orderBy(desc(analysisJobs.createdAt))
    .limit(1);

  if (job?.status === "processing") return;

  await db
    .update(artworks)
    .set({ status: "analyzing", updatedAt: new Date() })
    .where(eq(artworks.id, artworkId));

  if (job) {
    await db
      .update(analysisJobs)
      .set({
        status: "processing",
        attempts: job.attempts + 1,
        updatedAt: new Date(),
      })
      .where(eq(analysisJobs.id, job.id));
  }

  try {
    const { imageBuffer, mimeType } = await loadArtworkImage(artwork);
    const provider = getVisionProvider();
    const result = await provider.analyzeArtwork({
      imageBuffer,
      mimeType,
      title: artwork.title,
      hint: [artwork.note, artwork.textDescription].filter(Boolean).join(" ") || undefined,
    });

    const enrichedResult = {
      ...result,
      analysisSource: provider.name,
    };

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, result.categorySlug))
      .limit(1);

    await db
      .update(artworks)
      .set({
        status: "ready",
        categoryId: category?.id ?? artwork.categoryId,
        publicSummary: result.summaryZh.slice(0, 120),
        updatedAt: new Date(),
      })
      .where(eq(artworks.id, artworkId));

    await db.delete(artworkAnalyses).where(eq(artworkAnalyses.artworkId, artworkId));

    await db.insert(artworkAnalyses).values({
      artworkId,
      visionResult: enrichedResult,
      summaryZh: result.summaryZh,
      subjects: [result.subject],
      techniques: result.styleKeywords,
      styleKeywords: result.styleKeywords,
      mood: result.mood,
      colorPalette: result.colorPalette,
      composition: result.composition,
      skillLevelEstimate: result.skillLevelEstimate,
      confidence: result.confidence ?? 0.8,
    });

    await db.delete(artworkTags).where(eq(artworkTags.artworkId, artworkId));

    for (const tagName of result.tags) {
      const [existing] = await db
        .select()
        .from(tags)
        .where(eq(tags.name, tagName))
        .limit(1);

      const tagId =
        existing?.id ??
        (
          await db.insert(tags).values({ name: tagName }).returning({ id: tags.id })
        )[0].id;

      await db.insert(artworkTags).values({ artworkId, tagId });
    }

    if (job) {
      await db
        .update(analysisJobs)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(analysisJobs.id, job.id));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const attempts = (job?.attempts ?? 0) + 1;
    const failed = attempts >= MAX_ATTEMPTS;

    await db
      .update(artworks)
      .set({
        status: failed ? "failed" : "pending",
        updatedAt: new Date(),
      })
      .where(eq(artworks.id, artworkId));

    if (job) {
      await db
        .update(analysisJobs)
        .set({
          status: failed ? "failed" : "pending",
          lastError: message,
          updatedAt: new Date(),
        })
        .where(eq(analysisJobs.id, job.id));
    }

    if (!failed) throw error;
  }
}

export async function enqueueAnalysisJob(artworkId: string) {
  await db.insert(analysisJobs).values({ artworkId, status: "pending" });
}

export async function refreshUserInsights(userId: string) {
  const rows = await db
    .select({
      title: artworks.title,
      summary: artworkAnalyses.summaryZh,
      tags: artworkAnalyses.styleKeywords,
    })
    .from(artworks)
    .innerJoin(artworkAnalyses, eq(artworkAnalyses.artworkId, artworks.id))
    .where(and(eq(artworks.userId, userId), eq(artworks.status, "ready")))
    .orderBy(desc(artworks.createdAt))
    .limit(30);

  if (rows.length < 1) {
    throw new Error("至少需要 1 张已完成分析的作品，请先在画夹中上传并等待分析完成");
  }

  const summaries = rows.map((r) => ({
    title: r.title,
    summary: r.summary,
    tags: (r.tags as string[]) ?? [],
  }));

  const provider = getVisionProvider();
  const insights = await provider.aggregateInsights(summaries);

  const existing = await db
    .select()
    .from(styleProfiles)
    .where(eq(styleProfiles.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(styleProfiles)
      .set({
        aggregatedTraits: insights.aggregatedTraits,
        radarScores: insights.radarScores,
        updatedAt: new Date(),
      })
      .where(eq(styleProfiles.userId, userId));
  } else {
    await db.insert(styleProfiles).values({
      userId,
      aggregatedTraits: insights.aggregatedTraits,
      radarScores: insights.radarScores,
    });
  }

  await db.insert(growthAdvices).values({
    userId,
    focusAreas: insights.focusAreas,
    exercises: insights.exercises,
    references: insights.references,
  });

  return insights;
}

export async function processPendingJobs(limit = 5) {
  const pending = await db
    .select({ artworkId: analysisJobs.artworkId })
    .from(analysisJobs)
    .where(eq(analysisJobs.status, "pending"))
    .limit(limit);

  for (const { artworkId } of pending) {
    try {
      await processArtworkAnalysis(artworkId);
    } catch {
      // handled in processArtworkAnalysis
    }
  }
}

export async function reanalyzeAllForUser(userId: string) {
  const rows = await db
    .select({ id: artworks.id })
    .from(artworks)
    .where(
      and(
        eq(artworks.userId, userId),
        inArray(artworks.status, ["pending", "failed", "analyzing"])
      )
    );

  for (const { id } of rows) {
    await db
      .update(artworks)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(artworks.id, id));
    await enqueueAnalysisJob(id);
    await processArtworkAnalysis(id);
  }

  return rows.length;
}
