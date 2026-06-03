"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function ProgressCurveChart({
  data,
}: {
  data: { date: string; score: number; title: string }[];
}) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-zinc-500">
        再积累 {2 - data.length} 张已分析作品，即可绘制进步曲线
      </p>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#ffffff11" />
          <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#1a1225", border: "1px solid #f472b633" }}
            labelStyle={{ color: "#f9a8d4" }}
          />
          <Line type="monotone" dataKey="score" stroke="#f472b6" strokeWidth={2} dot={{ fill: "#f472b6" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
