export interface StorageAdapter {
  save(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void>;
  getPublicUrl(key: string): string;
  read(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}
