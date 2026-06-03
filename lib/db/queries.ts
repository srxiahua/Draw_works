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
import { getStorage } from "@/lib/storage";

export async function getPublicArtworks(options?: {
  categorySlug?: string;
  limit?: number;
}) {
  const limit = options?.limit ?? 50;

  let categoryId: string | undefined;
  if (options?.categorySlug) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, options.categorySlug))
      .limit(1);
    categoryId = cat?.id;
  }

  const conditions = [eq(artworks.isPublic, true), eq(artworks.status, "ready")];
  if (categoryId) {
    conditions.push(eq(artworks.categoryId, categoryId));
  }

  const rows = await db
    .select({
      artwork: artworks,
      category: categories,
      analysis: artworkAnalyses,
    })
    .from(artworks)
    .leftJoin(categories, eq(artworks.categoryId, categories.id))
    .leftJoin(artworkAnalyses, eq(artworkAnalyses.artworkId, artworks.id))
    .where(and(...conditions))
    .orderBy(desc(artworks.createdAt))
    .limit(limit);

  const storage = getStorage();
  return rows.map((r) => ({
    ...r.artwork,
    imageUrl: storage.getPublicUrl(r.artwork.storageKey),
    thumbUrl: storage.getPublicUrl(r.artwork.thumbKey),
    category: r.category,
    analysis: r.analysis,
  }));
}

export async function getArtworkWithDetails(id: string, userId?: string) {
  const [row] = await db
    .select({
      artwork: artworks,
      category: categories,
      analysis: artworkAnalyses,
    })
    .from(artworks)
    .leftJoin(categories, eq(artworks.categoryId, categories.id))
    .leftJoin(artworkAnalyses, eq(artworkAnalyses.artworkId, artworks.id))
    .where(eq(artworks.id, id))
    .limit(1);

  if (!row) return null;

  if (!row.artwork.isPublic && row.artwork.userId !== userId) {
    return null;
  }

  const tagRows = await db
    .select({ name: tags.name })
    .from(artworkTags)
    .innerJoin(tags, eq(artworkTags.tagId, tags.id))
    .where(eq(artworkTags.artworkId, id));

  const [lastJob] = await db
    .select({ lastError: analysisJobs.lastError })
    .from(analysisJobs)
    .where(eq(analysisJobs.artworkId, id))
    .orderBy(desc(analysisJobs.createdAt))
    .limit(1);

  const storage = getStorage();
  return {
    ...row.artwork,
    imageUrl: storage.getPublicUrl(row.artwork.storageKey),
    thumbUrl: storage.getPublicUrl(row.artwork.thumbKey),
    category: row.category,
    analysis: row.analysis,
    tagNames: tagRows.map((t) => t.name),
    lastError: lastJob?.lastError ?? null,
  };
}

export async function getUserArtworks(userId: string) {
  const rows = await db
    .select({
      artwork: artworks,
      category: categories,
      analysis: artworkAnalyses,
    })
    .from(artworks)
    .leftJoin(categories, eq(artworks.categoryId, categories.id))
    .leftJoin(artworkAnalyses, eq(artworkAnalyses.artworkId, artworks.id))
    .where(eq(artworks.userId, userId))
    .orderBy(desc(artworks.createdAt));

  const storage = getStorage();
  const ids = rows.map((r) => r.artwork.id);

  const allTags =
    ids.length > 0
      ? await db
          .select({
            artworkId: artworkTags.artworkId,
            name: tags.name,
          })
          .from(artworkTags)
          .innerJoin(tags, eq(artworkTags.tagId, tags.id))
          .where(inArray(artworkTags.artworkId, ids))
      : [];

  const tagsByArtwork = new Map<string, string[]>();
  for (const t of allTags) {
    const list = tagsByArtwork.get(t.artworkId) ?? [];
    list.push(t.name);
    tagsByArtwork.set(t.artworkId, list);
  }

  return rows.map((r) => ({
    ...r.artwork,
    imageUrl: storage.getPublicUrl(r.artwork.storageKey),
    thumbUrl: storage.getPublicUrl(r.artwork.thumbKey),
    category: r.category,
    analysis: r.analysis,
    tagNames: tagsByArtwork.get(r.artwork.id) ?? [],
  }));
}

export async function getUserInsights(userId: string) {
  const [profile] = await db
    .select()
    .from(styleProfiles)
    .where(eq(styleProfiles.userId, userId))
    .limit(1);

  const advices = await db
    .select()
    .from(growthAdvices)
    .where(eq(growthAdvices.userId, userId))
    .orderBy(desc(growthAdvices.generatedAt))
    .limit(10);

  return { profile: profile ?? null, advices };
}

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getUserAnalysisStats(userId: string) {
  const rows = await db
    .select({ status: artworks.status })
    .from(artworks)
    .where(eq(artworks.userId, userId));

  const stats = {
    total: rows.length,
    ready: 0,
    pending: 0,
    analyzing: 0,
    failed: 0,
  };

  for (const r of rows) {
    if (r.status === "ready") stats.ready++;
    else if (r.status === "pending") stats.pending++;
    else if (r.status === "analyzing") stats.analyzing++;
    else if (r.status === "failed") stats.failed++;
  }

  const [profile] = await db
    .select({ id: styleProfiles.id })
    .from(styleProfiles)
    .where(eq(styleProfiles.userId, userId))
    .limit(1);

  return { ...stats, hasProfile: !!profile };
}

export async function getRecentUserArtworks(userId: string, limit = 12) {
  const rows = await getUserArtworks(userId);
  return rows.slice(0, limit);
}

export async function getCategoryMatrix(userId: string) {
  const cats = await getCategories();
  const rows = await getUserArtworks(userId);

  return cats.map((cat) => {
    const items = rows.filter((a) => a.categoryId === cat.id);
    return {
      category: cat,
      count: items.length,
      recent: items.slice(0, 4).map((a) => ({
        id: a.id,
        title: a.title,
        thumbUrl: a.thumbUrl,
        status: a.status,
      })),
    };
  });
}

export async function getTimelineGroups(userId: string) {
  const rows = await getUserArtworks(userId);
  const groups = new Map<string, typeof rows>();

  for (const a of rows) {
    const d = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    const list = groups.get(key) ?? [];
    list.push(a);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([month, items]) => ({ month, items }));
}

export async function getProgressCurve(userId: string) {
  const rows = await db
    .select({
      title: artworks.title,
      createdAt: artworks.createdAt,
      confidence: artworkAnalyses.confidence,
      skill: artworkAnalyses.skillLevelEstimate,
    })
    .from(artworks)
    .innerJoin(artworkAnalyses, eq(artworkAnalyses.artworkId, artworks.id))
    .where(and(eq(artworks.userId, userId), eq(artworks.status, "ready")))
    .orderBy(artworks.createdAt);

  return rows.map((r) => {
    const d = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
    let score = (r.confidence ?? 0.6) * 100;
    if (r.skill?.includes("熟练")) score = Math.max(score, 85);
    else if (r.skill?.includes("进阶")) score = Math.max(score, 65);
    else if (r.skill?.includes("入门")) score = Math.min(score, 45);
    return {
      date: d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      score: Math.round(score),
      title: r.title,
    };
  });
}

export async function getCategoryDistribution(userId: string) {
  const rows = await db
    .select({
      name: categories.name,
      slug: categories.slug,
    })
    .from(artworks)
    .leftJoin(categories, eq(artworks.categoryId, categories.id))
    .where(and(eq(artworks.userId, userId), eq(artworks.status, "ready")));

  const counts = new Map<string, { name: string; slug: string; value: number }>();
  for (const r of rows) {
    const name = r.name ?? "未分类";
    const slug = r.slug ?? "other";
    const key = slug;
    const prev = counts.get(key);
    if (prev) prev.value++;
    else counts.set(key, { name, slug, value: 1 });
  }

  return [...counts.values()].sort((a, b) => b.value - a.value);
}

export async function getCreatorProfileStats(userId: string) {
  const rows = await db
    .select({ createdAt: artworks.createdAt })
    .from(artworks)
    .where(eq(artworks.userId, userId))
    .orderBy(artworks.createdAt);

  const total = rows.length;
  const firstAt = rows[0]?.createdAt
    ? rows[0].createdAt instanceof Date
      ? rows[0].createdAt
      : new Date(rows[0].createdAt)
    : null;

  return { total, firstAt };
}

export async function getHomePageData(userId: string) {
  const [
    artworks,
    { profile, advices },
    stats,
    evolution,
    categoryDistribution,
    creatorRaw,
    categories,
  ] = await Promise.all([
    getUserArtworks(userId),
    getUserInsights(userId),
    getUserAnalysisStats(userId),
    getStyleEvolution(userId),
    getCategoryDistribution(userId),
    getCreatorProfileStats(userId),
    getCategories(),
  ]);

  const traits = profile?.aggregatedTraits as {
    strengths?: string[];
    recurringThemes?: string[];
    overallSummary?: string;
  } | null;

  const allTags = [
    ...new Set([...(traits?.strengths ?? []), ...(traits?.recurringThemes ?? [])]),
  ];

  return {
    artworks: artworks.slice(0, 12),
    allArtworks: artworks,
    categories,
    radarScores: (profile?.radarScores as Record<string, number>) ?? null,
    traits,
    allTags,
    stats,
    evolution,
    categoryDistribution,
    creatorRaw,
    latestAdvice: advices[0] ?? null,
  };
}

export async function getSketchbookHomeData(userId: string) {
  const [recent, { profile }, stats] = await Promise.all([
    getRecentUserArtworks(userId, 16),
    getUserInsights(userId),
    getUserAnalysisStats(userId),
  ]);

  return {
    recent,
    radarScores: (profile?.radarScores as Record<string, number>) ?? null,
    traits: profile?.aggregatedTraits ?? null,
    stats,
  };
}

/** 按月聚合风格标签与完成度，用于演变轨迹 */
export async function getStyleEvolution(userId: string) {
  const rows = await db
    .select({
      createdAt: artworks.createdAt,
      styleKeywords: artworkAnalyses.styleKeywords,
      confidence: artworkAnalyses.confidence,
      categoryName: categories.name,
    })
    .from(artworks)
    .innerJoin(artworkAnalyses, eq(artworkAnalyses.artworkId, artworks.id))
    .leftJoin(categories, eq(artworks.categoryId, categories.id))
    .where(and(eq(artworks.userId, userId), eq(artworks.status, "ready")))
    .orderBy(artworks.createdAt);

  const monthMap = new Map<
    string,
    { tags: Map<string, number>; scores: number[]; categories: Map<string, number> }
  >();

  for (const r of rows) {
    const d = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { tags: new Map(), scores: [], categories: new Map() });
    }
    const bucket = monthMap.get(key)!;
    bucket.scores.push(Math.round((r.confidence ?? 0.65) * 100));

    for (const t of (r.styleKeywords as string[]) ?? []) {
      bucket.tags.set(t, (bucket.tags.get(t) ?? 0) + 1);
    }
    if (r.categoryName) {
      bucket.categories.set(r.categoryName, (bucket.categories.get(r.categoryName) ?? 0) + 1);
    }

    monthMap.set(key, { ...bucket, _label: label } as typeof bucket & { _label?: string });
  }

  return [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket]) => {
      const [y, m] = key.split("-");
      const topTags = [...bucket.tags.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t]) => t);
      const topCategory =
        [...bucket.categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "综合";
      const avgScore =
        bucket.scores.length > 0
          ? Math.round(bucket.scores.reduce((a, b) => a + b, 0) / bucket.scores.length)
          : 0;
      return {
        month: `${y}年${Number(m)}月`,
        monthKey: key,
        count: bucket.scores.length,
        avgScore,
        topTags,
        topCategory,
      };
    });
}

export function buildDnaNarrative(
  traits: Record<string, unknown> | null,
  evolution: Awaited<ReturnType<typeof getStyleEvolution>>,
  latestAdvice?: { focusAreas: string; exercises: string } | null
): string {
  if (!traits) return "";

  const summary = (traits.overallSummary as string) ?? "";
  const parts: string[] = [];

  if (evolution.length >= 2) {
    const first = evolution[0];
    const last = evolution[evolution.length - 1];
    if (last.avgScore > first.avgScore + 5) {
      parts.push(
        `从 ${first.month} 到 ${last.month}，你的作品完成度整体提升了约 ${last.avgScore - first.avgScore} 分，成长轨迹清晰可见。`
      );
    }
    if (last.topCategory !== first.topCategory) {
      parts.push(
        `创作重心从「${first.topCategory}」逐渐拓展到「${last.topCategory}」，题材面在变大。`
      );
    }
  }

  if (latestAdvice?.focusAreas) {
    const firstLine = latestAdvice.focusAreas.split("\n")[0];
    if (firstLine) parts.push(`下一阶段建议优先突破：${firstLine}。`);
  }

  if (parts.length === 0) return summary;
  return parts.join("");
}
