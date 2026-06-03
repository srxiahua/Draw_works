import { head } from "@vercel/blob";
import type { StorageAdapter } from "./types";
import { storageKeyToMediaUrl } from "./url";

/** Vercel Blob 存储（生产 serverless 环境） */
export class VercelBlobStorageAdapter implements StorageAdapter {
  private urlCache = new Map<string, string>();

  async save(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    this.urlCache.set(key, blob.url);
  }

  getPublicUrl(key: string): string {
    const cached = this.urlCache.get(key);
    if (cached) return cached;
    return storageKeyToMediaUrl(key);
  }

  async read(key: string): Promise<Buffer | null> {
    try {
      const meta = await head(key, { token: process.env.BLOB_READ_WRITE_TOKEN });
      if (!meta?.url) return null;
      const res = await fetch(meta.url);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const { del } = await import("@vercel/blob");
      await del(key, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {
      /* ignore */
    }
  }
}
