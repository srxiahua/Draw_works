import { getOwnerUserId } from "@/lib/owner";
import { getHomePageData } from "@/lib/db/queries";
import { WelcomeHome } from "@/components/welcome-home";

export default async function HomePage() {
  const userId = await getOwnerUserId();
  const data = await getHomePageData(userId);

  return (
    <WelcomeHome
      artworks={data.artworks.map((a) => ({
        id: a.id,
        title: a.title,
        thumbUrl: a.thumbUrl,
        status: a.status,
        tagNames: a.tagNames,
        category: a.category
          ? { id: a.category.id, name: a.category.name, slug: a.category.slug }
          : null,
      }))}
      categories={data.categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))}
      radarScores={data.radarScores}
      allTags={data.allTags}
      stats={{ total: data.stats.total, ready: data.stats.ready }}
      evolution={data.evolution}
      categoryDistribution={data.categoryDistribution}
      creatorRaw={data.creatorRaw}
    />
  );
}
