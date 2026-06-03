import { notFound } from "next/navigation";
import Link from "next/link";
import { getOwnerUserId } from "@/lib/owner";
import { getArtworkWithDetails, getProgressCurve } from "@/lib/db/queries";
import { WorkDetailClient } from "@/components/work-detail-client";

export default async function DashboardWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ownerId = await getOwnerUserId();
  const { id } = await params;
  const [artwork, progressCurve] = await Promise.all([
    getArtworkWithDetails(id, ownerId),
    getProgressCurve(ownerId),
  ]);

  if (!artwork || artwork.userId !== ownerId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-pink-300 hover:underline">
        ← 返回投递区
      </Link>
      <WorkDetailClient
        artwork={{
          id: artwork.id,
          title: artwork.title,
          note: artwork.note,
          status: artwork.status,
          isPublic: artwork.isPublic,
          imageUrl: artwork.imageUrl,
          tagNames: artwork.tagNames,
          category: artwork.category,
          inputType: artwork.inputType,
          sourceUrl: artwork.sourceUrl,
          textDescription: artwork.textDescription,
          progressCurve,
          analysis: artwork.analysis
            ? {
                summaryZh: artwork.analysis.summaryZh,
                mood: artwork.analysis.mood,
                colorPalette: artwork.analysis.colorPalette,
                composition: artwork.analysis.composition,
                skillLevelEstimate: artwork.analysis.skillLevelEstimate,
                styleKeywords: (artwork.analysis.styleKeywords as string[]) ?? [],
                visionResult: artwork.analysis.visionResult,
              }
            : null,
          lastError: artwork.lastError,
        }}
      />
    </div>
  );
}
