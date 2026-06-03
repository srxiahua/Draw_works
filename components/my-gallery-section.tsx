"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type Artwork = {
  id: string;
  title: string;
  thumbUrl: string;
  status: string;
  category?: { id: string; name: string; slug: string } | null;
  tagNames?: string[];
};

type Category = { id: string; name: string; slug: string };

export function MyGallerySection({
  artworks,
  categories,
}: {
  artworks: Artwork[];
  categories: Category[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return artworks;
    return artworks.filter((a) => a.category?.slug === filter);
  }, [artworks, filter]);

  const usedCategories = categories.filter((c) =>
    artworks.some((a) => a.category?.slug === c.slug)
  );

  return (
    <section id="gallery" className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm tracking-widest text-violet-300/80">✦ MY GALLERY ✦</p>
          <h2 className="font-display text-2xl text-pink-100">我的画廊</h2>
        </div>
        <Link href="/dashboard/archive" className="text-xs text-pink-300 hover:underline">
          完整档案 →
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`candy-pill ${filter === "all" ? "candy-pill-active" : ""}`}
        >
          全部
        </button>
        {usedCategories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setFilter(cat.slug)}
            className={`candy-pill ${filter === cat.slug ? "candy-pill-active" : ""}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="candy-card py-16 text-center text-zinc-500">
          {artworks.length === 0 ? "还没有作品，快去上传第一张吧 🐰" : "这个分类还没有作品哦"}
        </div>
      ) : (
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
          {filtered.map((a, i) => (
            <Link
              key={a.id}
              href={`/dashboard/works/${a.id}`}
              className="hover-wiggle group mb-3 block break-inside-avoid"
            >
              <div className="candy-card overflow-hidden">
                <div
                  className={`relative w-full overflow-hidden ${
                    i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={a.thumbUrl}
                    alt={a.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-110"
                    unoptimized
                  />
                  {a.category && (
                    <Badge className="absolute left-2 top-2 border-0 bg-black/40 text-[10px] text-pink-100 backdrop-blur-sm">
                      {a.category.name}
                    </Badge>
                  )}
                </div>
                <p className="truncate px-3 py-2 text-xs text-zinc-300">{a.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
