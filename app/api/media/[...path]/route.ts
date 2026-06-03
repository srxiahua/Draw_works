import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { getStorage } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = decodeURIComponent(path.join("/"));

  if (process.env.STORAGE_DRIVER === "vercel-blob") {
    try {
      const meta = await head(key, { token: process.env.BLOB_READ_WRITE_TOKEN });
      if (meta?.url) {
        return NextResponse.redirect(meta.url, 302);
      }
    } catch {
      /* fall through */
    }
  }

  const storage = getStorage();
  const buffer = await storage.read(key);
  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
