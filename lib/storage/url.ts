import { getBaseUrl } from "@/lib/utils";

/** 将 storage key 转为可路由的 media URL（避免 encodeURIComponent 整段 key 导致斜杠问题） */
export function storageKeyToMediaUrl(key: string): string {
  const segments = key.split("/").map(encodeURIComponent).join("/");
  return `${getBaseUrl()}/api/media/${segments}`;
}
