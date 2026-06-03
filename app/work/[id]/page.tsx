import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArtworkWithDetails } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artwork = await getArtworkWithDetails(id);
  return { title: artwork?.title ?? "作品" };
}

export default async function PublicWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artwork = await getArtworkWithDetails(id);

  if (!artwork || !artwork.isPublic) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/gallery" className="text-sm text-violet-300 hover:underline">
        ← 返回作品集
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{artwork.title}</h1>
          <p className="text-sm text-zinc-500">
            {new Date(artwork.createdAt).toLocaleDateString("zh-CN")}
          </p>

          {artwork.category && <Badge>{artwork.category.name}</Badge>}

          {artwork.publicSummary && (
            <p className="text-zinc-300 leading-relaxed">{artwork.publicSummary}</p>
          )}

          <div className="flex flex-wrap gap-1">
            {artwork.tagNames.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
