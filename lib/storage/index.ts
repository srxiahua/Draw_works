import { LocalStorageAdapter } from "./local";
import { OssStorageAdapter } from "./oss";
import { VercelBlobStorageAdapter } from "./vercel-blob";
import type { StorageAdapter } from "./types";

let storage: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storage) {
    const driver = process.env.STORAGE_DRIVER ?? "local";
    if (driver === "oss") {
      storage = new OssStorageAdapter();
    } else if (driver === "vercel-blob") {
      storage = new VercelBlobStorageAdapter();
    } else {
      storage = new LocalStorageAdapter();
    }
  }
  return storage;
}

export function buildStorageKey(
  userId: string,
  artworkId: string,
  ext: string
): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${userId}/${yyyy}/${mm}/${artworkId}.${ext}`;
}
