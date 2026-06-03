import type { StorageAdapter } from "./types";

/**
 * Phase 3: Aliyun OSS adapter.
 * Set STORAGE_DRIVER=oss and configure OSS_* env vars.
 */
export class OssStorageAdapter implements StorageAdapter {
  constructor() {
    throw new Error(
      "OSS storage is not configured. Set OSS_REGION, OSS_BUCKET, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET."
    );
  }

  async save(): Promise<void> {
    throw new Error("OSS not implemented");
  }

  getPublicUrl(): string {
    throw new Error("OSS not implemented");
  }

  async read(): Promise<Buffer | null> {
    throw new Error("OSS not implemented");
  }

  async delete(): Promise<void> {
    throw new Error("OSS not implemented");
  }
}
