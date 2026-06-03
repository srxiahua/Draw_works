const MAX_SIZE = 15 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extFromMime(mime: string) {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

function extractOgImage(html: string, baseUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) {
      try {
        return new URL(m[1], baseUrl).href;
      } catch {
        return m[1];
      }
    }
  }
  return null;
}

async function fetchWithHeaders(url: string, referer?: string) {
  return fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      ...(referer ? { Referer: referer } : {}),
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
}

async function downloadImage(url: string, referer?: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  ext: string;
}> {
  const res = await fetchWithHeaders(url, referer);
  if (!res.ok) throw new Error(`抓取失败 (${res.status})`);

  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim();

  if (contentType.startsWith("text/html") || contentType.includes("html")) {
    const html = await res.text();
    const ogImage = extractOgImage(html, url);
    if (!ogImage) throw new Error("页面中未找到图片，请尝试图片直链");
    return downloadImage(ogImage, url);
  }

  if (!IMAGE_TYPES.has(contentType) && !contentType.startsWith("image/")) {
    throw new Error("链接内容不是图片");
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_SIZE) throw new Error("图片超过 15MB");

  return {
    buffer,
    mimeType: contentType || "image/jpeg",
    ext: extFromMime(contentType),
  };
}

export async function fetchImageFromUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("链接格式不正确");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("仅支持 http/https 链接");
  }

  try {
    return await downloadImage(url, parsed.origin);
  } catch (firstError) {
    try {
      return await downloadImage(url);
    } catch {
      throw firstError instanceof Error ? firstError : new Error("链接抓取失败");
    }
  }
}
