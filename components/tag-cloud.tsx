"use client";

import { Badge } from "@/components/ui/badge";

export function TagCloud({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <p className="text-sm text-zinc-500">风格标签会在 AI 分析后自动出现 ✨</p>;
  }

  const sizes = ["text-xs", "text-sm", "text-base", "text-lg"];

  return (
    <div className="flex flex-wrap justify-center gap-2 py-2">
      {tags.map((tag, i) => (
        <Badge
          key={`${tag}-${i}`}
          className={`tag-cloud-item candy-badge px-3 py-1 ${sizes[i % sizes.length]}`}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
