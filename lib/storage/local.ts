import fs from "fs/promises";
import path from "path";
import type { StorageAdapter } from "./types";
import { getBaseUrl } from "@/lib/utils";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export class LocalStorageAdapter implements StorageAdapter {
  async save(key: string, buffer: Buffer, _contentType: string): Promise<void> {
    const filePath = path.join(UPLOAD_ROOT, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }

  getPublicUrl(key: string): string {
    return `${getBaseUrl()}/uploads/${key}`;
  }

  async read(key: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(UPLOAD_ROOT, key);
      return await fs.readFile(filePath);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(UPLOAD_ROOT, key);
      await fs.unlink(filePath);
    } catch {
      // ignore missing files
    }
  }
}
