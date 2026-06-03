import { getOwnerUserId } from "@/lib/owner";
import { getUserArtworks } from "@/lib/db/queries";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata = { title: "我的画夹" };

export default async function DashboardPage() {
  const userId = await getOwnerUserId();
  const artworks = await getUserArtworks(userId);

  const cardData = artworks.map((a) => ({
    id: a.id,
    title: a.title,
    thumbUrl: a.thumbUrl,
    status: a.status,
    isPublic: a.isPublic,
    publicSummary: a.publicSummary,
    tagNames: a.tagNames,
    category: a.category,
  }));

  return <DashboardClient initialArtworks={cardData} />;
}
