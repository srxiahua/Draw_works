"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import type { ArtworkCardData } from "@/components/artwork-card";

export function DashboardArtworkCard({
  artwork,
  onDeleted,
}: {
  artwork: ArtworkCardData;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;

    const ok = window.confirm(`确定删除「${artwork.title}」？此操作不可恢复。`);
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/artworks/${artwork.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "删除失败");
        return;
      }
      onDeleted(artwork.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10">
      <Link href={`/dashboard/works/${artwork.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
          <Image
            src={artwork.thumbUrl}
            alt={artwork.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
          <div className="absolute left-2 top-2">
            <StatusBadge status={artwork.status} />
          </div>
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

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={deleting}
        className="absolute right-2 top-2 h-8 w-8 bg-black/50 p-0 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100"
        onClick={handleDelete}
        title="删除作品"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 text-rose-300" />
        )}
      </Button>
    </div>
  );
}
