"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { HeatCurvePoint } from "@/lib/types";
import { formatDateShort } from "@/lib/utils";

interface Props {
  data: HeatCurvePoint[];
  height?: number;
  showMilestones?: boolean;
}

export default function TrendHeatCurve({ data, height = 240, showMilestones = true }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-slate-400 text-sm" style={{ height }}>
        暂无热度数据
      </div>
    );
  }

  const milestones = showMilestones ? data.filter((d) => d.milestone) : [];

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload as HeatCurvePoint;
              return (
                <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-xs border">
                  <div className="font-medium text-slate-900">{label}</div>
                  <div className="text-brand-600">热度: {d.heat}</div>
                  <div className="text-slate-500">
                    {d.signal_count} 条信号 · {d.topic_count} 篇专题
                  </div>
                  {d.milestone && (
                    <div className="mt-1 text-orange-600">📌 {d.milestone.title}</div>
                  )}
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="heat"
            stroke="#4F6EF7"
            strokeWidth={2.5}
            dot={{ fill: "#4F6EF7", r: 3 }}
            activeDot={{ r: 5, fill: "#4F6EF7" }}
          />
          {milestones.map((m, i) => (
            <ReferenceDot
              key={i}
              x={m.date}
              y={m.heat}
              r={6}
              fill="#f97316"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
