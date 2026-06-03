/** 创作者等级与统计 */

export type CreatorLevel = {
  level: number;
  title: string;
  emoji: string;
  nextAt: number | null;
};

export function computeCreatorLevel(totalWorks: number): CreatorLevel {
  if (totalWorks >= 31) {
    return { level: 4, title: "大师兄", emoji: "🌟", nextAt: null };
  }
  if (totalWorks >= 16) {
    return { level: 3, title: "小画家", emoji: "🎨", nextAt: 31 };
  }
  if (totalWorks >= 6) {
    return { level: 2, title: "练习生", emoji: "✏️", nextAt: 16 };
  }
  return { level: 1, title: "萌新画师", emoji: "🐰", nextAt: 6 };
}

export function computeCreationDays(firstCreatedAt: Date | null): number {
  if (!firstCreatedAt) return 0;
  const ms = Date.now() - firstCreatedAt.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
