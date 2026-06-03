"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const labels: Record<string, string> = {
  character: "人物",
  scene: "场景",
  color: "色彩",
  lineart: "线稿",
  completion: "完成度",
};

export function StyleRadarPanel({
  scores,
  compact = false,
}: {
  scores: Record<string, number> | null;
  compact?: boolean;
}) {
  if (!scores) {
    return (
      <div className={cnEmpty(compact)}>
        <p className="text-sm text-zinc-500">上传作品并完成分析后，这里会呈现你的风格雷达</p>
      </div>
    );
  }

  const data = Object.entries(scores).map(([k, v]) => ({
    subject: labels[k] ?? k,
    score: v,
  }));

  return (
    <div className={compact ? "h-64" : "h-80"}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#fbcfe833" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#f9a8d4", fontSize: 11 }} />
          <Radar dataKey="score" stroke="#f472b6" fill="#f472b6" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function cnEmpty(compact: boolean) {
  return `flex items-center justify-center rounded-xl border border-dashed border-pink-300/20 bg-white/5 ${compact ? "h-64 p-4" : "h-80 p-6"} text-center`;
}
