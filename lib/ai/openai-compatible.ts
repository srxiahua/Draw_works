import {
  artworkAnalysisSchema,
  insightsResultSchema,
  type ArtworkAnalysisResult,
  type InsightsResult,
} from "./schema";
import {
  ARTWORK_ANALYSIS_SYSTEM,
  artworkAnalysisUser,
  INSIGHTS_AGGREGATE_SYSTEM,
  insightsAggregateUser,
} from "./prompts";
import type { AnalyzeArtworkInput, VisionProvider } from "./provider";

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function toDataUrl(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export function createOpenAiCompatibleProvider(config: {
  apiKey: string;
  baseUrl: string;
  model: string;
  name: string;
}): VisionProvider {
  async function chat(
    messages: { role: string; content: unknown }[]
  ): Promise<string> {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API error ${res.status}: ${err}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");
    return content;
  }

  return {
    name: config.name,

    async analyzeArtwork(input: AnalyzeArtworkInput): Promise<ArtworkAnalysisResult> {
      const mime = input.mimeType ?? "image/webp";
      const dataUrl = toDataUrl(input.imageBuffer, mime);
      const content = await chat([
        { role: "system", content: ARTWORK_ANALYSIS_SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: artworkAnalysisUser(input.hint) + `\n作品标题：${input.title ?? "未命名"}`,
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ]);
      const parsed = JSON.parse(extractJson(content));
      const result = artworkAnalysisSchema.parse(parsed);
      return { ...result, confidence: result.confidence ?? 0.85 };
    },

    async aggregateInsights(summaries) {
      const content = await chat([
        { role: "system", content: INSIGHTS_AGGREGATE_SYSTEM },
        { role: "user", content: insightsAggregateUser(summaries) },
      ]);
      const parsed = JSON.parse(extractJson(content));
      return insightsResultSchema.parse(parsed);
    },
  };
}
