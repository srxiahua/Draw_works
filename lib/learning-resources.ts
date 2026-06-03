/** 根据练习方向生成可点击的学习资源（搜索链接，非爬虫） */

export type LearningResource = {
  title: string;
  description: string;
  href: string;
  platform: "bilibili" | "general";
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  人物: ["二次元人体结构", "动漫人物速写"],
  人体: ["人体动态速写", "二次元人体比例"],
  场景: ["场景透视教程", "二次元背景绘画"],
  透视: ["一点透视两点透视", "场景透视基础"],
  色彩: ["赛璐璐上色教程", "二次元配色"],
  线稿: ["线稿练习", "勾线技巧"],
  厚涂: ["厚涂入门", "数字厚涂教程"],
  赛璐璐: ["赛璐璐上色", "动漫赛璐璐"],
  构图: ["构图基础", "插画构图"],
  光影: ["二分阴影", "动漫光影"],
};

function bilibiliSearch(keyword: string) {
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;
}

function extractKeywords(text: string): string[] {
  const found = new Set<string>();
  for (const key of Object.keys(TOPIC_KEYWORDS)) {
    if (text.includes(key)) found.add(key);
  }
  if (found.size === 0) {
    const lines = text.split(/[\n,，、]/).map((s) => s.trim()).filter(Boolean);
    lines.slice(0, 2).forEach((l) => found.add(l.slice(0, 8)));
  }
  return [...found];
}

export function buildLearningResources(focusAreas: string, exercises: string): LearningResource[] {
  const combined = `${focusAreas}\n${exercises}`;
  const keys = extractKeywords(combined);
  const resources: LearningResource[] = [];

  for (const key of keys.slice(0, 4)) {
    const queries = TOPIC_KEYWORDS[key] ?? [`二次元${key}教程`];
    for (const q of queries.slice(0, 1)) {
      resources.push({
        title: `${key} · B站教程`,
        description: `搜索「${q}」相关视频与示范`,
        href: bilibiliSearch(q),
        platform: "bilibili",
      });
    }
  }

  if (resources.length === 0) {
    resources.push({
      title: "二次元绘画入门",
      description: "从基础人体与配色开始系统学习",
      href: bilibiliSearch("二次元绘画入门教程"),
      platform: "bilibili",
    });
  }

  return resources.slice(0, 6);
}
