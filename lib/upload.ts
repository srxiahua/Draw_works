import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fetchImageFromUrl as fetchImage } from "@/lib/fetch-image";
import { buildStorageKey, getStorage } from "@/lib/storage";

const MAX_SIZE = 15 * 1024 * 1024;

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

function resolveMimeType(file: File): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const ext = path.extname(file.name).toLowerCase();
  const mime = EXT_TO_MIME[ext];
  if (mime) return mime;
  throw new Error("仅支持 JPEG、PNG、WebP、GIF、HEIC 格式");
}

export function validateImageFile(file: File, mimeType: string) {
  if (!mimeType.startsWith("image/")) {
    throw new Error("仅支持 JPEG、PNG、WebP、GIF、HEIC 格式");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("单张图片不能超过 15MB");
  }
}

function extFromMime(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

export async function processAndStoreImage(
  file: File,
  userId: string,
  artworkId?: string
): Promise<{
  artworkId: string;
  storageKey: string;
  thumbKey: string;
  mimeType: string;
  fileSize: number;
}> {
  const mimeType = resolveMimeType(file);
  validateImageFile(file, mimeType);

  const id = artworkId ?? uuidv4();
  const ext = extFromMime(mimeType);
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storeImageBuffer(buffer, userId, id, ext, mimeType, file.size);
  return { artworkId: id, ...stored };
}

export async function storeImageBuffer(
  buffer: Buffer,
  userId: string,
  artworkId: string,
  ext: string,
  mimeType: string,
  fileSize: number
) {
  const storageKey = buildStorageKey(userId, artworkId, ext);
  const thumbKey = buildStorageKey(userId, `${artworkId}-thumb`, "webp");

  const storage = getStorage();
  await storage.save(storageKey, buffer, mimeType);

  const thumbBuffer = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await storage.save(thumbKey, thumbBuffer, "image/webp");

  return { storageKey, thumbKey, mimeType, fileSize };
}

export async function fetchImageFromUrl(url: string) {
  return fetchImage(url);
}

export async function createTextSketchPlaceholder(
  title: string,
  description: string
): Promise<Buffer> {
  const safeTitle = title.slice(0, 40).replace(/[<>&"]/g, "");
  const safeDesc = description.slice(0, 120).replace(/[<>&"]/g, "");

  const svg = `
<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fdf2f8"/>
      <stop offset="50%" style="stop-color:#fae8ff"/>
      <stop offset="100%" style="stop-color:#e0f2fe"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  <rect x="40" y="40" width="720" height="920" rx="24" fill="white" fill-opacity="0.85" stroke="#c4b5fd" stroke-width="3" stroke-dasharray="12 8"/>
  <text x="400" y="120" text-anchor="middle" font-size="36" fill="#7c3aed" font-family="sans-serif">📝 文字构思稿</text>
  <text x="400" y="200" text-anchor="middle" font-size="28" fill="#334155" font-family="sans-serif">${safeTitle}</text>
  <foreignObject x="80" y="260" width="640" height="600">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:22px;color:#475569;line-height:1.6;font-family:sans-serif;white-space:pre-wrap;">${safeDesc}</div>
  </foreignObject>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function processUrlSubmission(url: string, userId: string) {
  const { buffer, mimeType, ext } = await fetchImageFromUrl(url);
  const artworkId = uuidv4();
  const stored = await storeImageBuffer(
    buffer,
    userId,
    artworkId,
    ext,
    mimeType,
    buffer.length
  );
  return { ...stored, artworkId };
}

export async function processTextSubmission(
  title: string,
  description: string,
  userId: string
) {
  const artworkId = uuidv4();
  const buffer = await createTextSketchPlaceholder(title, description);
  const stored = await storeImageBuffer(
    buffer,
    userId,
    artworkId,
    "png",
    "image/png",
    buffer.length
  );
  return { ...stored, artworkId };
}

export function guessTitle(filename: string) {
  return path.basename(filename, path.extname(filename)) || "未命名作品";
}
