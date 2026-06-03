import { createOpenAiCompatibleProvider } from "./openai-compatible";
import { createLocalProvider } from "./local-provider";
import { getAiProviderName, type AiProviderName, type AnalyzeArtworkInput, type VisionProvider } from "./provider";

function pickRemoteProvider(): VisionProvider {
  const mode = getAiProviderName();

  if (mode !== "auto" && mode !== "local") {
    return createRemoteProvider(mode);
  }

  if (process.env.MIMO_API_KEY) return createRemoteProvider("mimo");
  if (process.env.DASHSCOPE_API_KEY) return createRemoteProvider("qwen");
  if (process.env.ZHIPU_API_KEY) return createRemoteProvider("zhipu");
  if (process.env.DOUBAO_API_KEY) return createRemoteProvider("doubao");

  throw new Error("No remote API key configured");
}

function createRemoteProvider(name: AiProviderName): VisionProvider {
  switch (name) {
    case "mimo": {
      const apiKey = process.env.MIMO_API_KEY;
      if (!apiKey) throw new Error("MIMO_API_KEY is not set");
      return createOpenAiCompatibleProvider({
        name: "mimo",
        apiKey,
        baseUrl:
          process.env.MIMO_BASE_URL ??
          "https://token-plan-cn.xiaomimimo.com/v1",
        model: process.env.MIMO_MODEL ?? "mimo-v2.5",
      });
    }
    case "zhipu": {
      const apiKey = process.env.ZHIPU_API_KEY;
      if (!apiKey) throw new Error("ZHIPU_API_KEY is not set");
      return createOpenAiCompatibleProvider({
        name: "zhipu",
        apiKey,
        baseUrl:
          process.env.ZHIPU_BASE_URL ??
          "https://open.bigmodel.cn/api/paas/v4",
        model: process.env.ZHIPU_VISION_MODEL ?? "glm-4v-flash",
      });
    }
    case "doubao": {
      const apiKey = process.env.DOUBAO_API_KEY;
      if (!apiKey) throw new Error("DOUBAO_API_KEY is not set");
      return createOpenAiCompatibleProvider({
        name: "doubao",
        apiKey,
        baseUrl:
          process.env.DOUBAO_BASE_URL ??
          "https://ark.cn-beijing.volces.com/api/v3",
        model: process.env.DOUBAO_VISION_MODEL ?? "doubao-1-5-vision-pro",
      });
    }
    case "qwen": {
      const apiKey = process.env.DASHSCOPE_API_KEY;
      if (!apiKey) throw new Error("DASHSCOPE_API_KEY is not set");
      return createOpenAiCompatibleProvider({
        name: "qwen",
        apiKey,
        baseUrl:
          process.env.DASHSCOPE_BASE_URL ??
          "https://dashscope.aliyuncs.com/compatible-mode/v1",
        model: process.env.DASHSCOPE_VISION_MODEL ?? "qwen-vl-max",
      });
    }
    default: {
      const apiKey = process.env.MIMO_API_KEY;
      if (!apiKey) throw new Error("MIMO_API_KEY is not set");
      return createOpenAiCompatibleProvider({
        name: "mimo",
        apiKey,
        baseUrl:
          process.env.MIMO_BASE_URL ??
          "https://token-plan-cn.xiaomimimo.com/v1",
        model: process.env.MIMO_MODEL ?? "mimo-v2.5",
      });
    }
  }
}

function wrapWithFallback(remote: VisionProvider, local: VisionProvider): VisionProvider {
  return {
    name: `${remote.name}+local`,

    async analyzeArtwork(input: AnalyzeArtworkInput) {
      try {
        const result = await remote.analyzeArtwork(input);
        return { ...result, suggestedFolder: result.suggestedFolder };
      } catch (error) {
        console.warn("[AI] Remote analysis failed, using local fallback:", error);
        return local.analyzeArtwork(input);
      }
    },

    async aggregateInsights(summaries) {
      try {
        return await remote.aggregateInsights(summaries);
      } catch (error) {
        console.warn("[AI] Remote insights failed, using local fallback:", error);
        return local.aggregateInsights(summaries);
      }
    },
  };
}

let provider: VisionProvider | null = null;

export function getVisionProvider(): VisionProvider {
  if (provider) return provider;

  const local = createLocalProvider();
  const mode = getAiProviderName();

  if (mode === "auto") {
    try {
      provider = wrapWithFallback(pickRemoteProvider(), local);
    } catch {
      provider = local;
    }
    return provider;
  }

  if (mode === "local") {
    provider = local;
    return provider;
  }

  provider = wrapWithFallback(createRemoteProvider(mode), local);
  return provider;
}

export function getAnalysisModeLabel(): string {
  const p = getVisionProvider();
  if (p.name === "local") return "本地图像分析";
  if (p.name.includes("local")) return "AI 分析（失败时本地兜底）";
  return `AI 分析 (${p.name})`;
}
