import Link from "next/link";
import { getPublicArtworks, getCategories } from "@/lib/db/queries";
import { ArtworkCard } from "@/components/artwork-card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "作品集" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const [artworks, categories] = await Promise.all([
    getPublicArtworks({ categorySlug, limit: 100 }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="font-display text-sm tracking-widest text-pink-300/70">
          ✦ PUBLIC GALLERY ✦
        </p>
        <h1 className="font-display mt-1 text-3xl text-pink-100">公开作品集</h1>
        <p className="mt-2 text-sm text-zinc-400">精选对外展示的创作，像手帐页一样陈列</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/gallery">
          <Badge
            className={
              !categorySlug
                ? "border-pink-400/40 bg-pink-500/25 text-pink-100"
                : "cursor-pointer border-white/10 hover:bg-white/10"
            }
          >
            全部
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/gallery?category=${cat.slug}`}>
            <Badge
              className={
                categorySlug === cat.slug
                  ? "border-pink-400/40 bg-pink-500/25 text-pink-100"
                  : "cursor-pointer border-white/10 hover:bg-white/10"
              }
            >
              {cat.name}
            </Badge>
          </Link>
        ))}
      </div>

      {artworks.length === 0 ? (
        <div className="sketch-card py-16 text-center text-zinc-500">
          该分类下暂无公开作品
        </div>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="mb-4 break-inside-avoid">
              <ArtworkCard
                artwork={{
                  id: artwork.id,
                  title: artwork.title,
                  thumbUrl: artwork.thumbUrl,
                  status: artwork.status,
                  publicSummary: artwork.publicSummary,
                  category: artwork.category,
                }}
                href={`/work/${artwork.id}`}
                className="sketch-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/10"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
