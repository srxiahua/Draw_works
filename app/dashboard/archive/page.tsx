import { getOwnerUserId } from "@/lib/owner";
import {
  getCategoryMatrix,
  getTimelineGroups,
} from "@/lib/db/queries";
import { ArchiveClient } from "@/components/archive-client";

export const metadata = { title: "创作档案" };

export default async function ArchivePage() {
  const userId = await getOwnerUserId();
  const [matrix, timeline] = await Promise.all([
    getCategoryMatrix(userId),
    getTimelineGroups(userId),
  ]);

  return (
    <ArchiveClient
      matrix={matrix.map((m) => ({
        slug: m.category.slug,
        name: m.category.name,
        count: m.count,
        recent: m.recent,
      }))}
      timeline={timeline.map((g) => ({
        month: g.month,
        items: g.items.map((a) => ({
          id: a.id,
          title: a.title,
          thumbUrl: a.thumbUrl,
          status: a.status,
          inputType: a.inputType,
          tagNames: a.tagNames,
          category: a.category,
        })),
      }))}
    />
  );
}
