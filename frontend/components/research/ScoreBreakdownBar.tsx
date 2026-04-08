import type { ScoreBreakdown } from "@/lib/types";

const DIMENSIONS = [
  { key: "timeliness", label: "时效性", max: 1.0 },
  { key: "implementability", label: "实操性", max: 1.0 },
  { key: "impact", label: "影响力", max: 1.0 },
  { key: "material_richness", label: "材料丰富度", max: 0.3 },
  { key: "actionability", label: "可行动性", max: 0.3 },
  { key: "innovation", label: "创新性", max: 0.3 },
  { key: "trend_bonus", label: "趋势加成", max: 0.3 },
] as const;

interface Props {
  breakdown: ScoreBreakdown;
  total: number;
}

export default function ScoreBreakdownBar({ breakdown, total }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{total}</span>
        <span className="text-sm text-slate-400">/ 9.5</span>
      </div>
      <div className="space-y-1.5">
        {DIMENSIONS.map((dim) => {
          const value = breakdown[dim.key as keyof ScoreBreakdown] || 0;
          const pct = Math.round((value / dim.max) * 100);
          return (
            <div key={dim.key} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-slate-500 shrink-0">{dim.label}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-slate-400">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
