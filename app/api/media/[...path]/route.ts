import { head } from "@vercel/blob";
import { getStorage } from "@/lib/storage";

function decodeStorageKey(pathSegments: string[]) {
  return pathSegments.map((s) => decodeURIComponent(s)).join("/");
}

function guessMime(key: string) {
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = decodeStorageKey(path);

  if (process.env.STORAGE_DRIVER === "vercel-blob") {
    try {
      const meta = await head(key, { token: process.env.BLOB_READ_WRITE_TOKEN });
      if (meta?.url) {
        return Response.redirect(meta.url, 302);
      }
    } catch {
      /* fall through */
    }
  }

  const storage = getStorage();
  const buffer = await storage.read(key);
  if (!buffer) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": guessMime(key),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
