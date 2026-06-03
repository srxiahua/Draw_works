import sharp from "sharp";
import type { ArtworkAnalysisResult, InsightsResult } from "./schema";
import type { AnalyzeArtworkInput, VisionProvider } from "./provider";

function rgbToColorName(r: number, g: number, b: number): string {
  if (Math.max(r, g, b) - Math.min(r, g, b) < 25) {
    const avg = (r + g + b) / 3;
    return avg > 180 ? "浅灰/白" : avg < 60 ? "深灰/黑" : "中性灰";
  }
  if (r >= g && r >= b) return r > 200 && g > 120 ? "暖粉/橙" : "红/暖色";
  if (g >= r && g >= b) return "绿/青";
  return "蓝/紫";
}

function pickCategory(aspect: number, title: string, hint: string) {
  const text = `${title} ${hint}`.toLowerCase();
  if (/线稿|草稿|sketch|lineart/.test(text)) return "lineart";
  if (/同人|fanart|角色/.test(text)) return "fanart";
  if (/场景|背景|landscape|scene/.test(text)) return "scene";
  if (/立绘|人物|portrait|character/.test(text)) return "character";
  if (aspect > 1.35) return "scene";
  if (aspect < 0.78) return "character";
  return "practice";
}

function folderName(slug: string) {
  const map: Record<string, string> = {
    character: "角色立绘",
    scene: "场景",
    fanart: "同人",
    practice: "练习稿",
    lineart: "线稿",
    colored: "插画",
    comic: "漫画",
  };
  return map[slug] ?? "练习稿";
}

export function createLocalProvider(): VisionProvider {
  return {
    name: "local",

    async analyzeArtwork(input: AnalyzeArtworkInput): Promise<ArtworkAnalysisResult> {
      const { imageBuffer, title = "未命名作品", hint = "" } = input;
      const meta = await sharp(imageBuffer).metadata();
      const width = meta.width ?? 800;
      const height = meta.height ?? 800;
      const aspect = width / height;
      const stats = await sharp(imageBuffer)
        .resize(80, 80, { fit: "inside" })
        .stats();

      const dom = stats.dominant;
      const colorName = rgbToColorName(dom.r, dom.g, dom.b);
      const categorySlug = pickCategory(aspect, title, hint);
      const isWide = aspect > 1.2;
      const isTall = aspect < 0.85;
      const brightness = dom.r + dom.g + dom.b;

      const subject = isTall
        ? "竖构图，偏人物或立绘向画面"
        : isWide
          ? "横构图，偏场景或海报向画面"
          : "方形或接近方构图，主体居中";

      const composition = isTall
        ? "竖版构图，适合角色展示与手机壁纸比例"
        : isWide
          ? "横版宽屏构图，信息面较广，适合海报与场景"
          : "均衡构图，主体集中，视觉重心较稳定";

      const styleKeywords = [
        brightness > 420 ? "偏明亮" : "偏暗调",
        meta.hasAlpha ? "含透明区域" : "不透明完成稿",
        "二次元向",
      ];

      const tags = [
        colorName,
        isTall ? "竖构图" : isWide ? "横构图" : "方构图",
        categorySlug === "lineart" ? "线稿向" : "彩色向",
        `${width}×${height}`,
      ];

      if (hint) tags.push("含创作备注");

      const summaryZh =
        `这幅「${title}」以${colorName}为主调，${composition.slice(0, 24)}。` +
        `从画面比例与色彩分布看，适合归入${folderName(categorySlug)}。` +
        (hint
          ? `结合你的备注「${hint.slice(0, 30)}」，建议后续在同题材上加强光影与完成度练习。`
          : "建议在同题材上继续积累系列作品，便于观察风格变化。");

      return {
        categorySlug,
        tags: tags.slice(0, 8),
        subject,
        styleKeywords,
        colorPalette: `主色倾向 ${colorName}（RGB 约 ${dom.r},${dom.g},${dom.b}），整体${brightness > 380 ? "偏亮" : "偏沉"}`,
        composition,
        skillLevelEstimate: "进阶（本地图像分析，配置有效 AI Key 后可获得更精准点评）",
        mood: brightness > 400 ? "明快" : "沉稳",
        summaryZh,
        suggestedFolder: folderName(categorySlug),
        confidence: 0.55,
      };
    },

    async aggregateInsights(summaries): Promise<InsightsResult> {
      const tagCount = new Map<string, number>();
      const categories = new Map<string, number>();

      for (const s of summaries) {
        for (const t of s.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
        if (/竖构图|立绘|人物/.test(s.summary)) {
          categories.set("character", (categories.get("character") ?? 0) + 1);
        }
        if (/横构图|场景|海报/.test(s.summary)) {
          categories.set("scene", (categories.get("scene") ?? 0) + 1);
        }
      }

      const topTags = [...tagCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([t]) => t);

      const n = summaries.length;
      const charScore = Math.min(
        100,
        Math.round(((categories.get("character") ?? 0) / n) * 100 + 40)
      );
      const sceneScore = Math.min(
        100,
        Math.round(((categories.get("scene") ?? 0) / n) * 100 + 35)
      );

      return {
        aggregatedTraits: {
          strengths: topTags.slice(0, 3).length ? topTags.slice(0, 3) : ["色彩运用", "构图稳定"],
          recurringThemes: topTags.slice(0, 4),
          colorTendency:
            topTags.find((t) => /色|调|灰|粉|蓝|绿|红/.test(t)) ?? "色彩风格尚在形成中",
          lineAndColorStyle:
            "基于本地汇总：作品以彩色完成度为主，线稿与上色节奏可在系列创作中继续观察",
          subStyleComparison: "整体偏二次元插画向，可对照日系动画赛璐璐或游戏立绘方向深化",
          overallSummary: `已汇总 ${n} 张作品。常见标签包括 ${topTags.join("、") || "多种题材"}。建议在优势题材上形成系列，同时补齐场景或人物短板。`,
        },
        radarScores: {
          character: charScore,
          scene: sceneScore,
          color: 62,
          lineart: 55,
          completion: Math.min(100, 50 + n * 8),
        },
        focusAreas:
          charScore < sceneScore
            ? "人物比例与表情\n立绘完成度与细节"
            : "场景透视与氛围\n背景光影层次",
        exercises:
          "每周 3 张 30 分钟速写，锁定同一题材\n做 1 张单色二分阴影练习，强化体积感\n选 1 张旧作重绘，对比前后差异",
        references:
          "可搜索「二次元场景透视教程」「赛璐璐上色步骤」按关键词系统练习（本地洞察；配置有效 AI Key 后可获得更个性化建议）",
      };
    },
  };
}
