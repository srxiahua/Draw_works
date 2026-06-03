"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MatrixCell = {
  slug: string;
  name: string;
  count: number;
  recent: { id: string; title: string; thumbUrl: string; status: string }[];
};

type TimelineItem = {
  id: string;
  title: string;
  thumbUrl: string;
  status: string;
  inputType: string;
  tagNames: string[];
  category: { name: string } | null;
};

export function ArchiveClient({
  matrix,
  timeline,
}: {
  matrix: MatrixCell[];
  timeline: { month: string; items: TimelineItem[] }[];
}) {
  const [view, setView] = useState<"matrix" | "timeline">("matrix");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-pink-100">个人创作档案</h1>
        <p className="text-sm text-zinc-400">时间线 + 分类矩阵，纵览你的创作版图</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView("matrix")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm",
            view === "matrix" ? "bg-pink-500/25 text-pink-100" : "bg-white/5 text-zinc-400"
          )}
        >
          <LayoutGrid className="h-4 w-4" /> 分类矩阵
        </button>
        <button
          type="button"
          onClick={() => setView("timeline")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm",
            view === "timeline" ? "bg-sky-500/25 text-sky-100" : "bg-white/5 text-zinc-400"
          )}
        >
          <GitBranch className="h-4 w-4" /> 时间线
        </button>
      </div>

      {view === "matrix" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matrix.map((cell) => (
            <div key={cell.slug} className="sketch-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-zinc-200">{cell.name}</h3>
                <Badge>{cell.count}</Badge>
              </div>
              {cell.recent.length === 0 ? (
                <p className="text-xs text-zinc-500">暂无作品</p>
              ) : (
                <div className="grid grid-cols-4 gap-1">
                  {cell.recent.map((a) => (
                    <Link key={a.id} href={`/dashboard/works/${a.id}`} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image src={a.thumbUrl} alt={a.title} fill className="object-cover" unoptimized />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {timeline.length === 0 ? (
            <p className="text-center text-zinc-500 py-12">暂无时间线记录</p>
          ) : (
            timeline.map((group) => (
              <div key={group.month}>
                <h3 className="mb-4 font-display text-lg text-sky-200">{group.month}</h3>
                <div className="relative space-y-4 border-l-2 border-pink-400/30 pl-6">
                  {group.items.map((a) => (
                    <Link
                      key={a.id}
                      href={`/dashboard/works/${a.id}`}
                      className="sketch-card flex gap-4 p-3 transition hover:border-pink-400/30"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image src={a.thumbUrl} alt={a.title} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-zinc-200">{a.title}</p>
                        <p className="text-xs text-zinc-500">
                          {a.inputType === "text" ? "文字构思" : a.inputType === "url" ? "链接抓取" : "图片上传"}
                          {a.category ? ` · ${a.category.name}` : ""}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {a.tagNames.slice(0, 3).map((t, i) => (
                            <Badge key={`${t}-${i}`} className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
