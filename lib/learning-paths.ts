/** 固定三条学习路径，进度来自雷达分 */

export type LearningPath = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  radarKey: string;
  progress: number;
  steps: string[];
  copyText: string;
};

const PATH_DEFS = [
  {
    id: "body",
    title: "人体动态",
    emoji: "🏃‍♀️",
    radarKey: "character",
    description: "从比例到动态，让角色「活」起来",
    steps: [
      "① 每天 15 分钟火柴人动态速写",
      "② 练习头身比与关节转折",
      "③ 临摹 3 张同 pose 再自己画",
    ],
    copyText:
      "【人体动态练习计划】\n1. 每天 15 分钟火柴人动态速写\n2. 练习头身比与关节转折\n3. 临摹 3 张同 pose 再自己画\n推荐搜索：二次元人体结构 / 动漫人物速写",
  },
  {
    id: "scene",
    title: "场景透视",
    emoji: "🏙️",
    radarKey: "scene",
    description: "一点两点透视，搭建有深度的世界",
    steps: [
      "① 画 5 张一点透视走廊",
      "② 练习两点透视的盒子与建筑",
      "③ 给场景加前景/中景/远景层次",
    ],
    copyText:
      "【场景透视练习计划】\n1. 画 5 张一点透视走廊\n2. 练习两点透视的盒子与建筑\n3. 给场景加前景/中景/远景层次\n推荐搜索：场景透视教程 / 二次元背景绘画",
  },
  {
    id: "color",
    title: "色彩搭配",
    emoji: "🌈",
    radarKey: "color",
    description: "赛璐璐与配色，让画面更甜更亮",
    steps: [
      "① 做 1 张单色二分阴影练习",
      "② 尝试互补色 / 邻近色配色",
      "③ 重绘旧作，只改配色不改线稿",
    ],
    copyText:
      "【色彩搭配练习计划】\n1. 做 1 张单色二分阴影练习\n2. 尝试互补色 / 邻近色配色\n3. 重绘旧作，只改配色不改线稿\n推荐搜索：赛璐璐上色教程 / 二次元配色",
  },
] as const;

export function buildLearningPaths(
  radarScores: Record<string, number> | null
): LearningPath[] {
  return PATH_DEFS.map((p) => ({
    id: p.id,
    title: p.title,
    emoji: p.emoji,
    radarKey: p.radarKey,
    description: p.description,
    steps: [...p.steps],
    copyText: p.copyText,
    progress: Math.min(100, Math.max(8, radarScores?.[p.radarKey] ?? 20)),
  }));
}
