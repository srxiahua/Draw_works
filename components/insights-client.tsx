"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  StyleEvolutionChart,
  type StyleEvolutionPoint,
} from "@/components/style-evolution-chart";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { TagCloud } from "@/components/tag-cloud";
import { LearningPathCards } from "@/components/learning-path-cards";
import type { LearningResource } from "@/lib/learning-resources";
import type { LearningPath } from "@/lib/learning-paths";

type Profile = {
  aggregatedTraits: {
    strengths: string[];
    recurringThemes: string[];
    colorTendency: string;
    lineAndColorStyle: string;
    subStyleComparison: string;
    overallSummary: string;
  };
  radarScores?: Record<string, number> | null;
};

type Advice = {
  id: string;
  focusAreas: string;
  exercises: string;
  references: string;
  generatedAt: string;
};

type Stats = {
  total: number;
  ready: number;
  pending: number;
  analyzing: number;
  failed: number;
  hasProfile: boolean;
};

const radarLabels: Record<string, string> = {
  character: "人物",
  scene: "场景",
  color: "色彩",
  lineart: "线稿",
  completion: "完成度",
};

export function InsightsClient({
  profile,
  advices,
  stats,
  analysisMode,
  variant = "insights",
  evolution = [],
  dnaNarrative,
  learningResources = [],
  categoryDistribution = [],
  learningPaths = [],
}: {
  profile: Profile | null;
  advices: Advice[];
  stats: Stats;
  analysisMode: string;
  variant?: "insights" | "dna";
  evolution?: StyleEvolutionPoint[];
  dnaNarrative?: string;
  learningResources?: LearningResource[];
  categoryDistribution?: Array<{ name: string; slug: string; value: number }>;
  learningPaths?: LearningPath[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const radarData = profile?.radarScores
    ? Object.entries(profile.radarScores).map(([key, value]) => ({
        subject: radarLabels[key] ?? key,
        score: value,
      }))
    : [];

  const traits = profile?.aggregatedTraits;
  const allTags = [
    ...new Set([
      ...(traits?.strengths ?? []),
      ...(traits?.recurringThemes ?? []),
    ]),
  ];

  const canGenerate = stats.ready >= 1;
  const needsAnalysis = stats.failed + stats.pending + stats.analyzing > 0;

  async function analyzeAll() {
    setAnalyzingAll(true);
    setError(null);
    const res = await fetch("/api/artworks/analyze-all", { method: "POST" });
    const data = await res.json();
    setAnalyzingAll(false);
    if (!res.ok) {
      setError(data.error ?? "分析失败");
      return;
    }
    setSuccess(`已重新分析 ${data.count} 张作品`);
    router.refresh();
  }

  async function refresh() {
    if (!canGenerate) {
      setError("请先有至少 1 张「分析完成」的作品");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/insights/refresh", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "生成失败");
      return;
    }
    setSuccess("成长洞察已更新");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm tracking-widest text-pink-300/70">
            {variant === "dna" ? "✦ CREATION DNA ✦" : "INSIGHTS"}
          </p>
          <h1 className="font-display mt-1 text-2xl text-pink-100">
            {variant === "dna" ? "你的创作 DNA 报告" : "成长洞察"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {variant === "dna"
              ? "不是冷冰冰的数据——这是你的风格基因与成长处方笺"
              : "汇总作品分析结果，生成风格画像与练习建议"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">分析引擎：{analysisMode}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {needsAnalysis && (
            <Button variant="secondary" onClick={analyzeAll} disabled={analyzingAll}>
              {analyzingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  分析中…
                </>
              ) : (
                "分析未完成作品"
              )}
            </Button>
          )}
          <Button onClick={refresh} disabled={loading || !canGenerate}>
            {loading ? "生成中…" : "生成 / 刷新洞察"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">数据概况</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Badge>全部 {stats.total}</Badge>
          <Badge className="border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
            已分析 {stats.ready}
          </Badge>
          {stats.pending + stats.analyzing > 0 && (
            <Badge className="border-sky-400/30 bg-sky-500/15 text-sky-200">
              进行中 {stats.pending + stats.analyzing}
            </Badge>
          )}
          {stats.failed > 0 && (
            <Badge className="border-rose-400/30 bg-rose-500/15 text-rose-200">
              失败 {stats.failed}
            </Badge>
          )}
          {!canGenerate && (
            <Link href="/dashboard" className="text-violet-300 hover:underline">
              → 去画夹上传作品
            </Link>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {!profile ? (
        <Card className="sketch-card border-pink-300/20">
          <CardContent className="space-y-3 py-12 text-center text-zinc-400">
            <p className="font-display text-lg text-pink-200/80">
              {variant === "dna" ? "DNA 序列尚未生成" : "暂无洞察数据"}
            </p>
            <p>
              {canGenerate
                ? "已有可分析作品，点击「生成 / 刷新洞察」解锁你的创作 DNA"
                : "请先在投递区上传作品并完成分析"}
            </p>
            {needsAnalysis && (
              <p className="text-xs">
                有 {stats.failed + stats.pending} 张作品尚未完成分析，可点「分析未完成作品」
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {variant === "dna" && dnaNarrative && (
            <Card className="sketch-card border-sky-300/20">
              <CardHeader>
                <CardTitle className="font-display text-sky-200">成长叙事</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-zinc-300">{dnaNarrative}</p>
              </CardContent>
            </Card>
          )}

          {variant === "dna" && evolution.length > 0 && (
            <StyleEvolutionChart data={evolution} />
          )}

          {variant === "dna" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="candy-card">
                <CardHeader>
                  <CardTitle className="font-display text-pink-200">创作类型分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryPieChart data={categoryDistribution} />
                </CardContent>
              </Card>
              <Card className="candy-card">
                <CardHeader>
                  <CardTitle className="font-display text-pink-200">风格标签云</CardTitle>
                </CardHeader>
                <CardContent>
                  <TagCloud tags={allTags} />
                </CardContent>
              </Card>
            </div>
          )}

          {radarData.length > 0 && (
            <Card className="sketch-card">
              <CardHeader>
                <CardTitle className="font-display text-pink-200">能力雷达 · 风格基因</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#ffffff22" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    />
                    <Radar
                      dataKey="score"
                      stroke="#a78bfa"
                      fill="#a78bfa"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>风格标签云</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {allTags.length > 0 ? (
                allTags.map((t, i) => (
                  <Badge key={`${t}-${i}`} className="px-3 py-1 text-sm">
                    {t}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-zinc-500">暂无标签</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>风格画像</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-300">
              <p>{traits?.overallSummary}</p>
              <p>
                <span className="text-zinc-500">色彩倾向：</span>
                {traits?.colorTendency}
              </p>
              <p>
                <span className="text-zinc-500">线稿与上色：</span>
                {traits?.lineAndColorStyle}
              </p>
              <p>
                <span className="text-zinc-500">风格对照：</span>
                {traits?.subStyleComparison}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {advices.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-pink-100">
            {variant === "dna" ? "处方笺 · 方向建议" : "方向建议时间线"}
          </h2>
          {advices.map((a, idx) => (
            <Card key={a.id} className={variant === "dna" ? "sketch-card" : undefined}>
              <CardHeader>
                <CardTitle className="text-base text-zinc-400">
                  {new Date(a.generatedAt).toLocaleString("zh-CN")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="mb-1 font-medium text-violet-300">优先突破</p>
                  <p className="whitespace-pre-wrap text-zinc-300">{a.focusAreas}</p>
                </div>
                <div>
                  <p className="mb-1 font-medium text-fuchsia-300">练习计划</p>
                  <p className="whitespace-pre-wrap text-zinc-300">{a.exercises}</p>
                </div>
                <div>
                  <p className="mb-1 font-medium text-emerald-300">学习方向</p>
                  <p className="whitespace-pre-wrap text-zinc-300">{a.references}</p>
                </div>
                {variant === "dna" && idx === 0 && learningResources.length > 0 && (
                  <div className="border-t border-white/5 pt-4">
                    <p className="mb-2 font-medium text-amber-300">推荐学习资源</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {learningResources.map((r) => (
                        <a
                          key={r.href}
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-pink-400/30 hover:bg-pink-500/10"
                        >
                          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                          <div>
                            <p className="text-sm text-zinc-200 group-hover:text-pink-100">
                              {r.title}
                            </p>
                            <p className="text-xs text-zinc-500">{r.description}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {variant === "dna" && learningPaths.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-pink-100">成长建议 · 学习路径</h2>
          <LearningPathCards paths={learningPaths} />
        </div>
      )}
    </div>
  );
}
