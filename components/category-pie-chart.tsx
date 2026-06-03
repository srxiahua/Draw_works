"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#f472b6", "#a78bfa", "#38bdf8", "#fbbf24", "#34d399", "#fb7185", "#818cf8"];

type Item = { name: string; slug: string; value: number };

export function CategoryPieChart({ data }: { data: Item[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-pink-300/25 bg-white/5 text-sm text-zinc-500">
        上传作品后，这里会显示创作类型分布
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#2e1065",
              border: "1px solid rgba(244,114,182,0.3)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => <span className="text-pink-100">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
