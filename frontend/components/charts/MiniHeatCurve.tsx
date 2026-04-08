"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import type { MiniHeatPoint } from "@/lib/types";

interface Props {
  data: MiniHeatPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export default function MiniHeatCurve({ data, width = 80, height = 30, color = "#4F6EF7" }: Props) {
  if (data.length < 2) return null;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="heat"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
