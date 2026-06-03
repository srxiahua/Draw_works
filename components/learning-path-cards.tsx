"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { LearningPath } from "@/lib/learning-paths";

export function LearningPathCards({ paths }: { paths: LearningPath[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPath(path: LearningPath) {
    try {
      await navigator.clipboard.writeText(path.copyText);
      setCopiedId(path.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {paths.map((path) => (
        <div
          key={path.id}
          className="candy-card hover-wiggle group flex flex-col p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">{path.emoji}</span>
            <h3 className="font-display text-lg text-pink-100">{path.title}</h3>
          </div>
          <p className="mb-4 text-xs text-zinc-400">{path.description}</p>

          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-zinc-500">练习进度</span>
              <span className="font-medium text-pink-300">{path.progress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="progress-shine h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 transition-all duration-700"
                style={{ width: `${path.progress}%` }}
              />
            </div>
          </div>

          <ul className="mb-4 flex-1 space-y-1.5 text-xs text-zinc-300">
            {path.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => void copyPath(path)}
            className="flex items-center justify-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-500/15 px-3 py-2 text-xs text-pink-200 transition hover:bg-pink-500/25 group-hover:scale-105"
          >
            {copiedId === path.id ? (
              <>
                <Check className="h-3.5 w-3.5" /> 已复制
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> 复制练习计划
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
