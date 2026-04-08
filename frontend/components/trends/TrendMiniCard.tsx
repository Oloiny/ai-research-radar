import Link from "next/link";
import { cn, scoreColor } from "@/lib/utils";
import type { LinkedTrend } from "@/lib/types";
import TrendStatusBadge from "@/components/trends/TrendStatusBadge";

interface TrendMiniCardProps {
  trend: LinkedTrend;
}

export default function TrendMiniCard({ trend }: TrendMiniCardProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-sm transition-colors hover:bg-slate-100">
      {/* Label + status */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/trends/${trend.key}`}
          className="font-medium text-slate-800 hover:text-blue-700 transition-colors truncate"
        >
          {trend.label}
        </Link>
        <TrendStatusBadge status={trend.status} />
      </div>

      {/* Meta line */}
      <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
        <span>出现 {trend.occurrence_count} 期</span>
        <span
          className={cn(
            "font-semibold tabular-nums px-1.5 py-0.5 rounded",
            scoreColor(trend.latest_heat_score)
          )}
        >
          热度 {trend.latest_heat_score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
