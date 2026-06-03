import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";

export type ArtworkCardData = {
  id: string;
  title: string;
  thumbUrl: string;
  status: string;
  isPublic?: boolean;
  publicSummary?: string | null;
  tagNames?: string[];
  category?: { name: string } | null;
};

export function ArtworkCard({
  artwork,
  href,
  showStatus = false,
  className,
}: {
  artwork: ArtworkCardData;
  href: string;
  showStatus?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10 ${className ?? ""}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
        <Image
          src={artwork.thumbUrl}
          alt={artwork.title}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
        />
        {showStatus && (
          <div className="absolute left-2 top-2">
            <StatusBadge status={artwork.status} />
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <h3 className="truncate font-medium text-zinc-100">{artwork.title}</h3>
        {artwork.publicSummary && (
          <p className="line-clamp-2 text-xs text-zinc-400">
            {artwork.publicSummary}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {artwork.category && (
            <Badge className="border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200">
              {artwork.category.name}
            </Badge>
          )}
          {artwork.tagNames?.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
