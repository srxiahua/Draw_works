"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SubmitZone } from "@/components/submit-zone";
import { DashboardArtworkCard } from "@/components/dashboard-artwork-card";
import { Button } from "@/components/ui/button";
import type { ArtworkCardData } from "@/components/artwork-card";

export function DashboardClient({
  initialArtworks,
}: {
  initialArtworks: ArtworkCardData[];
}) {
  const listRef = useRef<HTMLElement>(null);
  const [artworks, setArtworks] = useState(initialArtworks);

  useEffect(() => {
    setArtworks(initialArtworks);
  }, [initialArtworks]);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/artworks");
    if (!res.ok) return;
    const data = await res.json();
    setArtworks(
      data.artworks.map(
        (a: ArtworkCardData & { thumbUrl: string }) => ({
          id: a.id,
          title: a.title,
          thumbUrl: a.thumbUrl,
          status: a.status,
          isPublic: a.isPublic,
          publicSummary: a.publicSummary,
          tagNames: a.tagNames ?? [],
          category: a.category,
        })
      )
    );
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setArtworks((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    const hasPending = artworks.some(
      (a) =>
        a.status === "pending" ||
        a.status === "analyzing" ||
        a.status === "failed"
    );
    if (!hasPending) return;

    const interval = setInterval(refreshList, 4000);
    return () => clearInterval(interval);
  }, [artworks, refreshList]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-pink-100">投递区</h1>
        <p className="text-sm text-zinc-400">图片 · 链接 · 文字，三种方式记录创作</p>
      </div>

      <SubmitZone onSubmitted={refreshList} />

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/dashboard/archive">创作档案 →</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/dashboard/dna">创作 DNA →</Link>
        </Button>
      </div>

      <section ref={listRef}>
        <h2 className="mb-4 text-lg font-semibold">
          全部作品 {artworks.length > 0 && `(${artworks.length})`}
        </h2>
        {artworks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-zinc-400">
            <p className="text-lg">上传第一张，让 AI 帮你整理画夹</p>
            <p className="mt-2 text-sm">作品将自动分类、打标签并生成点评</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {artworks.map((artwork) => (
              <DashboardArtworkCard
                key={artwork.id}
                artwork={artwork}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
