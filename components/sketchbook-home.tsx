import Link from "next/link";
import Image from "next/image";
import { StyleRadarPanel } from "@/components/style-radar-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Recent = {
  id: string;
  title: string;
  thumbUrl: string;
  status: string;
  tagNames?: string[];
  category?: { name: string } | null;
};

type Props = {
  recent: Recent[];
  radarScores: Record<string, number> | null;
  traits: { overallSummary?: string } | null;
  stats: { total: number; ready: number };
};

export function SketchbookHome({ recent, radarScores, traits, stats }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 text-center md:text-left">
        <p className="font-display text-sm tracking-widest text-pink-300/80">✦ SKETCHBOOK ✦</p>
        <h1 className="font-display mt-2 text-4xl text-pink-100 md:text-5xl">
          打开你的创作手帐
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          投递作品 · AI 解析风格 DNA · 记录成长轨迹。像翻 sketchbook 一样，看见自己的绘画进化。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
          <Button asChild><Link href="/dashboard">投递作品</Link></Button>
          <Button asChild variant="secondary"><Link href="/dashboard/dna">创作 DNA</Link></Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* 左侧：瀑布流 */}
        <div className="sketch-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-sky-200">最近投递</h2>
            <Badge className="border-sky-400/30 bg-sky-500/15 text-sky-200">
              {stats.total} 件 · 已分析 {stats.ready}
            </Badge>
          </div>

          {recent.length === 0 ? (
            <p className="py-16 text-center text-zinc-500">还没有作品，去投递区上传第一张吧</p>
          ) : (
            <div className="columns-2 gap-3 md:columns-3">
              {recent.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/dashboard/works/${a.id}`}
                  className="group mb-3 block break-inside-avoid overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 transition hover:border-pink-400/40"
                >
                  <div className={`relative w-full overflow-hidden ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`}>
                    <Image src={a.thumbUrl} alt={a.title} fill className="object-cover transition group-hover:scale-105" unoptimized />
                    <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-pink-200 backdrop-blur-sm">
                      {a.category?.name ?? "待分类"}
                    </span>
                  </div>
                  <p className="truncate px-2 py-2 text-xs text-zinc-300">{a.title}</p>
                </Link>
              ))}
            </div>
          )}
          {recent.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/dashboard/archive" className="text-sm text-pink-300 hover:underline">
                查看完整创作档案 →
              </Link>
            </div>
          )}
        </div>

        {/* 右侧：雷达 + 摘要 */}
        <div className="space-y-4">
          <div className="sketch-card p-4">
            <h2 className="font-display mb-2 text-lg text-pink-200">风格雷达</h2>
            <StyleRadarPanel scores={radarScores} compact />
          </div>
          {traits?.overallSummary && (
            <div className="sketch-card p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-400">风格速写</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{traits.overallSummary as string}</p>
              <Link href="/dashboard/dna" className="mt-3 inline-block text-xs text-pink-300 hover:underline">
                查看完整 DNA 报告 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
