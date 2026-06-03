import Link from "next/link";
import { RabbitMascot } from "@/components/rabbit-mascot";
import { FloatingDecor } from "@/components/floating-decor";
import { HomeSubmitZone } from "@/components/home-submit-zone";
import { MyGallerySection } from "@/components/my-gallery-section";
import { StyleRadarPanel } from "@/components/style-radar-panel";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { TagCloud } from "@/components/tag-cloud";
import { StyleEvolutionChart } from "@/components/style-evolution-chart";
import { LearningPathCards } from "@/components/learning-path-cards";
import { Button } from "@/components/ui/button";
import { computeCreatorLevel, computeCreationDays } from "@/lib/creator-stats";
import { buildLearningPaths } from "@/lib/learning-paths";

type Props = {
  artworks: Array<{
    id: string;
    title: string;
    thumbUrl: string;
    status: string;
    category?: { id: string; name: string; slug: string } | null;
    tagNames?: string[];
  }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  radarScores: Record<string, number> | null;
  allTags: string[];
  stats: { total: number; ready: number };
  evolution: Array<{
    month: string;
    monthKey: string;
    count: number;
    avgScore: number;
    topTags: string[];
    topCategory: string;
  }>;
  categoryDistribution: Array<{ name: string; slug: string; value: number }>;
  creatorRaw: { total: number; firstAt: Date | null };
};

export function WelcomeHome({
  artworks,
  categories,
  radarScores,
  allTags,
  stats,
  evolution,
  categoryDistribution,
  creatorRaw,
}: Props) {
  const level = computeCreatorLevel(creatorRaw.total);
  const days = computeCreationDays(creatorRaw.firstAt);
  const paths = buildLearningPaths(radarScores);

  return (
    <div className="relative">
      <FloatingDecor />

      <div className="relative z-10 mx-auto max-w-6xl space-y-16 px-4 py-10">
        {/* ── 欢迎区 ── */}
        <section className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-display text-sm tracking-[0.2em] text-pink-300/90">
              ✦ WELCOME BACK ✦
            </p>
            <h1 className="font-display mt-2 text-4xl leading-tight text-transparent bg-gradient-to-r from-pink-200 via-fuchsia-200 to-violet-200 bg-clip-text md:text-5xl">
              嗨，小画家！
              <br />
              今天也要开心创作呀
            </h1>
            <p className="mt-4 max-w-md text-sm text-zinc-400">
              上传作品 · AI 帮你归类 · 看看自己的成长曲线，像翻糖果色手帐一样记录每一笔进步 ✨
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <StatCard label="作品数" value={String(stats.total)} unit="张" accent="pink" />
              <StatCard label="创作天数" value={String(days)} unit="天" accent="sky" />
              <StatCard
                label="等级"
                value={`Lv.${level.level}`}
                unit={level.title}
                emoji={level.emoji}
                accent="violet"
              />
            </div>

            {level.nextAt && (
              <p className="mt-3 text-xs text-zinc-500">
                再上传 {level.nextAt - stats.total} 张就能升级啦 {level.emoji}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <RabbitMascot />
          </div>
        </section>

        {/* ── 上传区 ── */}
        <section id="upload" className="scroll-mt-20">
          <div className="mb-4">
            <p className="font-display text-sm tracking-widest text-pink-300/80">✦ UPLOAD ✦</p>
            <h2 className="font-display text-2xl text-pink-100">作品上传</h2>
            <p className="mt-1 text-sm text-zinc-400">拖拽图片到这里，AI 会自动帮你归类打标签</p>
          </div>
          <HomeSubmitZone />
        </section>

        {/* ── 我的画廊 ── */}
        <MyGallerySection artworks={artworks} categories={categories} />

        {/* ── AI 风格诊断 ── */}
        <section id="diagnosis" className="scroll-mt-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-sm tracking-widest text-sky-300/80">✦ AI DIAGNOSIS ✦</p>
              <h2 className="font-display text-2xl text-pink-100">AI 风格诊断</h2>
              <p className="mt-1 text-sm text-zinc-400">
                已分析 {stats.ready} 张 · 饼图、雷达、标签云、成长趋势一目了然
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/dna">完整 DNA 报告 →</Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="candy-card p-5">
              <h3 className="font-display mb-3 text-pink-200">创作类型</h3>
              <CategoryPieChart data={categoryDistribution} />
            </div>
            <div className="candy-card p-5">
              <h3 className="font-display mb-3 text-pink-200">风格能力雷达</h3>
              <StyleRadarPanel scores={radarScores} compact />
            </div>
            <div className="candy-card p-5 lg:col-span-2">
              <h3 className="font-display mb-3 text-center text-pink-200">风格标签云</h3>
              <TagCloud tags={allTags} />
            </div>
            {evolution.length > 0 && (
              <div className="lg:col-span-2">
                <StyleEvolutionChart data={evolution} />
              </div>
            )}
          </div>
        </section>

        {/* ── 成长建议 ── */}
        <section id="paths" className="scroll-mt-20">
          <div className="mb-6">
            <p className="font-display text-sm tracking-widest text-fuchsia-300/80">✦ GROW UP ✦</p>
            <h2 className="font-display text-2xl text-pink-100">成长建议 · 学习路径</h2>
            <p className="mt-1 text-sm text-zinc-400">
              三条专属练习路线，点复制就能发给闺蜜或贴进手帐里
            </p>
          </div>
          <LearningPathCards paths={paths} />
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  emoji,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  emoji?: string;
  accent: "pink" | "sky" | "violet";
}) {
  const borders = {
    pink: "border-pink-400/30 from-pink-500/20 to-fuchsia-500/10",
    sky: "border-sky-400/30 from-sky-500/20 to-cyan-500/10",
    violet: "border-violet-400/30 from-violet-500/20 to-purple-500/10",
  };

  return (
    <div
      className={`hover-wiggle candy-card bg-gradient-to-br p-4 ${borders[accent]}`}
    >
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="font-display mt-1 text-2xl text-pink-50">
        {emoji && <span className="mr-1">{emoji}</span>}
        {value}
      </p>
      <p className="text-xs text-zinc-400">{unit}</p>
    </div>
  );
}
