"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type StyleEvolutionPoint = {
  month: string;
  monthKey: string;
  count: number;
  avgScore: number;
  topTags: string[];
  topCategory: string;
};

export function StyleEvolutionChart({ data }: { data: StyleEvolutionPoint[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    name: d.month.replace(/年(\d+)月/, (_, m) => `${m}月`),
    score: d.avgScore,
    count: d.count,
    fullMonth: d.month,
    topTags: d.topTags,
    topCategory: d.topCategory,
  }));

  return (
    <Card className="candy-card">
      <CardHeader>
        <CardTitle className="font-display text-pink-200">风格演变轨迹</CardTitle>
        <p className="text-xs text-zinc-500">按月汇总完成度与题材变化</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#ffffff12" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={{ stroke: "#ffffff22" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={{ stroke: "#ffffff22" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1225",
                  border: "1px solid rgba(244,114,182,0.2)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullMonth ?? ""
                }
                formatter={(value, name) => [
                  name === "score" ? `${value} 分` : `${value} 张`,
                  name === "score" ? "平均完成度" : "作品数",
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#f472b6"
                strokeWidth={2}
                dot={{ fill: "#a78bfa", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 border-t border-white/5 pt-4">
          {data.map((d) => (
            <div
              key={d.monthKey}
              className="flex flex-wrap items-center gap-2 text-sm"
            >
              <span className="w-20 shrink-0 text-zinc-500">{d.month}</span>
              <Badge className="border border-violet-400/30 bg-transparent text-violet-200">
                {d.topCategory}
              </Badge>
              {d.topTags.slice(0, 2).map((t) => (
                <Badge key={t} className="text-xs">
                  {t}
                </Badge>
              ))}
              <span className="text-xs text-zinc-600">{d.count} 张 · {d.avgScore} 分</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
