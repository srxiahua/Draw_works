"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Link2, Loader2, PenLine, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Tab = "image" | "url" | "text";

export function SubmitZone({ onSubmitted }: { onSubmitted?: () => void | Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [tab, setTab] = useState<Tab>("image");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textDesc, setTextDesc] = useState("");

  const finish = useCallback(
    async (res: Response) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "投递失败");
      const count = data.artworks?.length ?? 1;
      setSuccess(`✓ 已投递 ${count} 件作品，AI 正在解析…`);
      await onSubmitted?.();
    },
    [onSubmitted]
  );

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "投递失败");
      } finally {
        busyRef.current = false;
        setBusy(false);
        setProgress(null);
        setUploadPercent(0);
      }
    },
    []
  );

  const uploadWithProgress = useCallback(
    (url: string, body: FormData | string, contentType?: string) =>
      new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        if (contentType) xhr.setRequestHeader("Content-Type", contentType);

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadPercent(Math.min(99, Math.round((e.loaded / e.total) * 100)));
          }
        });

        xhr.addEventListener("load", () => {
          setUploadPercent(100);
          resolve(
            new Response(xhr.responseText, {
              status: xhr.status,
              headers: { "Content-Type": "application/json" },
            })
          );
        });
        xhr.addEventListener("error", () => reject(new Error("网络错误")));
        xhr.addEventListener("abort", () => reject(new Error("上传已取消")));

        if (body instanceof FormData) xhr.send(body);
        else xhr.send(body);
      }),
    []
  );

  const uploadImages = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic)$/i.test(f.name)
      );
      if (!list.length) {
        setError("请选择图片");
        return;
      }
      setProgress(`正在上传 ${list.length} 张…`);
      setUploadPercent(5);
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      if (note.trim()) fd.append("note", note.trim());
      await finish(await uploadWithProgress("/api/submit", fd));
      setNote("");
      if (inputRef.current) inputRef.current.value = "";
    },
    [note, finish, uploadWithProgress]
  );

  const tabs: { id: Tab; label: string; icon: typeof ImageIcon }[] = [
    { id: "image", label: "图片上传", icon: ImageIcon },
    { id: "url", label: "链接抓取", icon: Link2 },
    { id: "text", label: "文字描述", icon: PenLine },
  ];

  return (
    <div className="candy-card space-y-4 p-5">
      <div className="flex items-center gap-2">
        <span className="tape-corner" />
        <h2 className="font-display text-lg text-pink-200">作品投递区</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            disabled={busy}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition",
              tab === id
                ? "bg-pink-500/25 text-pink-100 ring-1 ring-pink-400/40"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "image" && (
        <div
          className={cn(
            "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center",
            busy ? "cursor-wait border-pink-400/50 bg-pink-500/10" : "border-pink-300/25 bg-white/5 hover:border-pink-300/50",
            dragging && "border-pink-400 bg-pink-500/15"
          )}
          onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) void run(() => uploadImages(e.dataTransfer.files));
          }}
          onClick={() => !busy && inputRef.current?.click()}
        >
          {busy && progress && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[#2d1b4e]/90 px-8 backdrop-blur-sm">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-pink-300" />
              <p className="mb-3 text-sm text-pink-200">{progress}</p>
              <div className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                <div
                  className="upload-progress-bar h-full"
                  style={{ width: `${Math.max(uploadPercent, 8)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-pink-300/80">{uploadPercent}%</p>
            </div>
          )}
          <ImageIcon className="mb-2 h-8 w-8 text-pink-300/80" />
          <p className="text-sm text-zinc-300">拖拽或点击选择图片</p>
          <input ref={inputRef} type="file" accept="image/*,.heic" multiple disabled={busy} className="hidden"
            onChange={(e) => e.target.files?.length && void run(() => uploadImages(e.target.files!))} />
        </div>
      )}

      {tab === "url" && (
        <div className="space-y-3">
          <div>
            <Label>图片链接</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… 作品图片直链" disabled={busy} className="mt-1" />
          </div>
          <div>
            <Label>标题（可选）</Label>
            <Input value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)} placeholder="作品名称" disabled={busy} className="mt-1" />
          </div>
        </div>
      )}

      {tab === "text" && (
        <div className="space-y-3">
          <div>
            <Label>构思标题</Label>
            <Input value={textTitle} onChange={(e) => setTextTitle(e.target.value)} placeholder="例：赛博朋克少女立绘构思" disabled={busy} className="mt-1" />
          </div>
          <div>
            <Label>文字描述</Label>
            <textarea
              value={textDesc}
              onChange={(e) => setTextDesc(e.target.value)}
              rows={4}
              disabled={busy}
              placeholder="描述角色、场景、风格、配色、构图想法…（至少 10 字）"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {(tab === "url" || tab === "text") && (
        <div>
          <Label>创作备注（可选）</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="练习目的、参考等" disabled={busy} className="mt-1" />
        </div>
      )}

      {tab === "image" && (
        <div>
          <Label>创作备注（可选）</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="练习目的、参考等" disabled={busy} className="mt-1" />
        </div>
      )}

      {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </div>
      )}

      {tab !== "image" && (
        <Button
          disabled={busy}
          className="w-full sm:w-auto"
          onClick={() =>
            void run(async () => {
              setProgress(tab === "url" ? "正在抓取图片…" : "正在生成构思稿…");
              const body =
                tab === "url"
                  ? { type: "url", url, title: urlTitle, note }
                  : { type: "text", title: textTitle, description: textDesc, note };
              await finish(await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              }));
              if (tab === "url") { setUrl(""); setUrlTitle(""); }
              else { setTextTitle(""); setTextDesc(""); }
            })
          }
        >
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" />处理中…</> : tab === "url" ? "抓取并投递" : "投递文字构思"}
        </Button>
      )}
    </div>
  );
}
