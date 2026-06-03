"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  onUploaded?: () => void | Promise<void>;
};

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      if (uploadingRef.current) return;

      const list = Array.from(files).filter((f) => {
        if (f.type.startsWith("image/")) return true;
        return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name);
      });

      if (list.length === 0) {
        setError("请选择图片文件（JPEG / PNG / WebP / GIF / HEIC）");
        return;
      }

      uploadingRef.current = true;
      setUploading(true);
      setError(null);
      setSuccess(null);
      setProgress(
        list.length === 1
          ? `正在上传「${list[0].name}」…`
          : `正在上传 ${list.length} 张图片…`
      );

      const formData = new FormData();
      list.forEach((f) => formData.append("files", f));
      if (note.trim()) formData.append("note", note.trim());

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        let data: { error?: string; artworks?: { title: string }[] } = {};
        try {
          data = await res.json();
        } catch {
          throw new Error("服务器响应异常");
        }

        if (!res.ok) throw new Error(data.error ?? "上传失败");

        const count = data.artworks?.length ?? list.length;
        setProgress(null);
        setSuccess(`✓ 已成功上传 ${count} 张作品`);
        setNote("");
        await onUploaded?.();
      } catch (e) {
        setProgress(null);
        setError(e instanceof Error ? e.message : "上传失败");
      } finally {
        uploadingRef.current = false;
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [note, onUploaded]
  );

  const openPicker = () => {
    if (uploadingRef.current) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition",
          uploading
            ? "cursor-wait border-violet-400/60 bg-violet-500/10"
            : "cursor-pointer border-violet-400/30 bg-violet-500/5 hover:border-violet-400/50 hover:bg-violet-500/10",
          dragging && !uploading && "border-violet-400 bg-violet-500/15"
        )}
        onDragOver={(e) => {
          if (uploading) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (uploading) return;
          e.preventDefault();
          setDragging(false);
          void uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && openPicker()}
      >
        {uploading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-[#0d0b14]/80 backdrop-blur-sm">
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-violet-300" />
            <p className="font-medium text-violet-200">{progress ?? "上传中…"}</p>
            <p className="mt-2 text-xs text-zinc-500">请勿重复点击，完成后会自动出现在下方列表</p>
          </div>
        )}

        <Upload className="mb-3 h-10 w-10 text-violet-300" />
        <p className="font-medium text-zinc-200">拖拽图片到此处，或点击选择</p>
        <p className="mt-1 text-xs text-zinc-500">
          支持 JPEG / PNG / WebP / GIF / HEIC，单张最大 15MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          disabled={uploading}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="upload-note">练习目的 / 参考（可选）</Label>
        <textarea
          id="upload-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          disabled={uploading}
          placeholder="例如：练习赛璐璐上色、参考某作品构图…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <Button
        type="button"
        disabled={uploading}
        className="w-full sm:w-auto"
        onClick={(e) => {
          e.stopPropagation();
          openPicker();
        }}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            上传中，请稍候…
          </>
        ) : (
          "选择图片上传"
        )}
      </Button>
    </div>
  );
}
