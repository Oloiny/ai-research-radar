"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ScoreBreakdown } from "@/lib/types";

const DIMENSIONS = [
  { key: "timeliness", label: "时效性", max: 1.0 },
  { key: "impact", label: "影响力", max: 1.0 },
  { key: "implementability", label: "实操性", max: 1.0 },
  { key: "innovation", label: "创新性", max: 0.3 },
  { key: "actionability", label: "可行动", max: 0.3 },
  { key: "material_richness", label: "材料丰富", max: 0.3 },
] as const;

interface Props {
  breakdown: ScoreBreakdown;
  size?: number;
}

export default function ScoreRadarChart({ breakdown, size = 220 }: Props) {
  const data = DIMENSIONS.map((dim) => {
    const raw = breakdown[dim.key as keyof ScoreBreakdown] || 0;
    // Normalize to 0-100 for display
    const normalized = Math.round((raw / dim.max) * 100);
    return {
      dimension: dim.label,
      value: normalized,
      raw,
      max: dim.max,
    };
  });

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="评分"
            dataKey="value"
            stroke="#4F6EF7"
            fill="#4F6EF7"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-xs border">
                  <div className="font-medium text-slate-900">{d.dimension}</div>
                  <div className="text-slate-500">{d.raw} / {d.max}</div>
                </div>
              );
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
