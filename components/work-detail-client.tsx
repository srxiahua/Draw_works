"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProgressCurveChart } from "@/components/progress-curve-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type ArtworkDetail = {
  id: string;
  title: string;
  note: string | null;
  status: string;
  isPublic: boolean;
  imageUrl: string;
  tagNames: string[];
  category: { name: string } | null;
  analysis: {
    summaryZh: string;
    mood: string | null;
    colorPalette: string | null;
    composition: string | null;
    skillLevelEstimate: string | null;
    styleKeywords: string[];
    visionResult: unknown;
  } | null;
  lastError?: string | null;
  inputType?: string;
  sourceUrl?: string | null;
  textDescription?: string | null;
  progressCurve?: { date: string; score: number; title: string }[];
};

export function WorkDetailClient({ artwork }: { artwork: ArtworkDetail }) {
  const router = useRouter();
  const [title, setTitle] = useState(artwork.title);
  const [note, setNote] = useState(artwork.note ?? "");
  const [isPublic, setIsPublic] = useState(artwork.isPublic);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/artworks/${artwork.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, note, isPublic }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  async function reanalyze() {
    setAnalyzing(true);
    await fetch(`/api/artworks/${artwork.id}/analyze`, { method: "POST" });
    setAnalyzing(false);
    router.refresh();
  }

  async function handleDelete() {
    const ok = window.confirm(`确定删除「${title}」？此操作不可恢复。`);
    if (!ok) return;

    setDeleting(true);
    const res = await fetch(`/api/artworks/${artwork.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "删除失败");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={artwork.status} />
          {artwork.category && <Badge>{artwork.category.name}</Badge>}
          {artwork.inputType === "url" && <Badge className="border-sky-400/30 bg-sky-500/15">链接抓取</Badge>}
          {artwork.inputType === "text" && <Badge className="border-amber-400/30 bg-amber-500/15">文字构思</Badge>}
        </div>

        {artwork.textDescription && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-sm text-zinc-300">
            <p className="mb-1 text-xs text-amber-200/80">文字构思原文</p>
            {artwork.textDescription}
          </div>
        )}

        {artwork.sourceUrl && (
          <p className="truncate text-xs text-zinc-500">
            来源：<a href={artwork.sourceUrl} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">{artwork.sourceUrl}</a>
          </p>
        )}

        <Card className="sketch-card">
          <CardHeader>
            <CardTitle className="text-base text-pink-200">进步曲线</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressCurveChart data={artwork.progressCurve ?? []} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Label htmlFor="title">标题</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-3">
          <Label htmlFor="note">备注</Label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
          <div>
            <p className="font-medium">公开展示</p>
            <p className="text-xs text-zinc-500">开启后出现在作品集页面</p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving || deleting}>
            {saving ? "保存中…" : "保存"}
          </Button>
          <Button variant="secondary" onClick={reanalyze} disabled={analyzing || deleting}>
            {analyzing ? "已提交分析…" : "重新分析"}
          </Button>
          <Button
            variant="secondary"
            disabled={deleting || saving}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            onClick={handleDelete}
          >
            {deleting ? "删除中…" : "删除作品"}
          </Button>
        </div>

        {artwork.status === "failed" && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            分析失败{artwork.lastError ? `：${artwork.lastError.slice(0, 120)}` : ""}。
            点击「重新分析」将使用本地图像分析兜底（Mimo Key 无效时仍可完成基础分析）。
          </div>
        )}

        {artwork.analysis && (
          <Card className="sketch-card">
            <CardHeader>
              <CardTitle className="text-pink-200">AI 解析报告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-300">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-zinc-500">创作类型</p>
                  <p>{artwork.category?.name ?? "待分类"}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-zinc-500">用色倾向</p>
                  <p>{artwork.analysis.colorPalette ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3 sm:col-span-2">
                  <p className="text-xs text-zinc-500">构图习惯</p>
                  <p>{artwork.analysis.composition ?? "—"}</p>
                </div>
              </div>
              {(artwork.analysis.visionResult as { analysisSource?: string })
                ?.analysisSource && (
                <p className="text-xs text-zinc-500">
                  分析来源：
                  {
                    (artwork.analysis.visionResult as { analysisSource?: string })
                      .analysisSource
                  }
                </p>
              )}
              <p>{artwork.analysis.summaryZh}</p>
              <p>
                <span className="text-zinc-500">氛围：</span>
                {artwork.analysis.mood}
              </p>
              <p>
                <span className="text-zinc-500">配色：</span>
                {artwork.analysis.colorPalette}
              </p>
              <p>
                <span className="text-zinc-500">构图：</span>
                {artwork.analysis.composition}
              </p>
              <p>
                <span className="text-zinc-500">水平：</span>
                {artwork.analysis.skillLevelEstimate}
              </p>
              <div className="flex flex-wrap gap-1">
                {artwork.analysis.styleKeywords?.map((k) => (
                  <Badge key={k}>{k}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-1">
          {artwork.tagNames.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
