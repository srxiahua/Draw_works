import type { ArtworkAnalysisResult, InsightsResult } from "./schema";

export type AnalyzeArtworkInput = {
  imageBuffer: Buffer;
  mimeType?: string;
  title?: string;
  hint?: string;
};

export interface VisionProvider {
  readonly name: string;
  analyzeArtwork(input: AnalyzeArtworkInput): Promise<ArtworkAnalysisResult>;
  aggregateInsights(
    summaries: { title: string; summary: string; tags: string[] }[]
  ): Promise<InsightsResult>;
}

export type AiProviderName = "auto" | "local" | "mimo" | "qwen" | "zhipu" | "doubao";

export function getAiProviderName(): AiProviderName {
  const name = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  if (name === "local" || name === "mimo" || name === "qwen" || name === "zhipu" || name === "doubao") {
    return name;
  }
  return "auto";
}
