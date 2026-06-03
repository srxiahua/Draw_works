import { z } from "zod";

export const artworkAnalysisSchema = z.object({
  categorySlug: z.string(),
  tags: z.array(z.string()).min(1).max(12),
  subject: z.string(),
  styleKeywords: z.array(z.string()).min(1).max(10),
  colorPalette: z.string(),
  composition: z.string(),
  skillLevelEstimate: z.string(),
  mood: z.string(),
  summaryZh: z.string().min(20).max(300),
  suggestedFolder: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});

export type ArtworkAnalysisResult = z.infer<typeof artworkAnalysisSchema>;

export const insightsResultSchema = z.object({
  aggregatedTraits: z.object({
    strengths: z.array(z.string()),
    recurringThemes: z.array(z.string()),
    colorTendency: z.string(),
    lineAndColorStyle: z.string(),
    subStyleComparison: z.string(),
    overallSummary: z.string(),
  }),
  radarScores: z.object({
    character: z.number().min(0).max(100),
    scene: z.number().min(0).max(100),
    color: z.number().min(0).max(100),
    lineart: z.number().min(0).max(100),
    completion: z.number().min(0).max(100),
  }),
  focusAreas: z.string(),
  exercises: z.string(),
  references: z.string(),
});

export type InsightsResult = z.infer<typeof insightsResultSchema>;
