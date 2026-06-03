import { getOwnerUserId } from "@/lib/owner";
import {
  getUserInsights,
  getUserAnalysisStats,
  getStyleEvolution,
  buildDnaNarrative,
  getCategoryDistribution,
} from "@/lib/db/queries";
import { getAnalysisModeLabel } from "@/lib/ai";
import { refreshUserInsights } from "@/lib/ai/jobs";
import { buildLearningResources } from "@/lib/learning-resources";
import { buildLearningPaths } from "@/lib/learning-paths";
import { InsightsClient } from "@/components/insights-client";

export const metadata = { title: "创作 DNA 报告" };

export default async function DnaPage() {
  const userId = await getOwnerUserId();

  let [{ profile, advices }, stats, evolution, categoryDistribution] = await Promise.all([
    getUserInsights(userId),
    getUserAnalysisStats(userId),
    getStyleEvolution(userId),
    getCategoryDistribution(userId),
  ]);

  // 有已分析作品但尚无 DNA 时，首次进入自动生成
  if (!profile && stats.ready >= 1) {
    try {
      await refreshUserInsights(userId);
      [{ profile, advices }, evolution] = await Promise.all([
        getUserInsights(userId),
        getStyleEvolution(userId),
      ]);
    } catch {
      // 生成失败时保留空态，用户可手动刷新
    }
  }

  const latestAdvice = advices[0] ?? null;
  const learningResources = latestAdvice
    ? buildLearningResources(latestAdvice.focusAreas, latestAdvice.exercises)
    : [];

  const dnaNarrative = profile
    ? buildDnaNarrative(
        profile.aggregatedTraits as Record<string, unknown>,
        evolution,
        latestAdvice
          ? { focusAreas: latestAdvice.focusAreas, exercises: latestAdvice.exercises }
          : null
      )
    : undefined;

  const radarScores = (profile?.radarScores as Record<string, number>) ?? null;
  const learningPaths = buildLearningPaths(radarScores);

  return (
    <InsightsClient
      variant="dna"
      stats={stats}
      analysisMode={getAnalysisModeLabel()}
      evolution={evolution}
      dnaNarrative={dnaNarrative || undefined}
      learningResources={learningResources}
      categoryDistribution={categoryDistribution}
      learningPaths={learningPaths}
      profile={
        profile
          ? {
              aggregatedTraits: profile.aggregatedTraits as {
                strengths: string[];
                recurringThemes: string[];
                colorTendency: string;
                lineAndColorStyle: string;
                subStyleComparison: string;
                overallSummary: string;
              },
              radarScores,
            }
          : null
      }
      advices={advices.map((a) => ({
        id: a.id,
        focusAreas: a.focusAreas,
        exercises: a.exercises,
        references: a.references,
        generatedAt: a.generatedAt.toISOString(),
      }))}
    />
  );
}
