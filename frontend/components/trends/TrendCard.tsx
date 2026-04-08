import Link from "next/link";
import { Calendar, Flame, Hash } from "lucide-react";
import { cn, formatDate, scoreColor } from "@/lib/utils";
import type { TrendListItem } from "@/lib/types";
import TrendStatusBadge from "@/components/trends/TrendStatusBadge";
import TagList from "@/components/shared/TagList";

interface TrendCardProps {
  trend: TrendListItem;
}

export default function TrendCard({ trend }: TrendCardProps) {
  return (
    <div className="bg-white rounded-xl border p-4 transition-all hover:shadow-md hover:border-slate-300">
      {/* Header: status + heat score */}
      <div className="flex items-center justify-between">
        <TrendStatusBadge status={trend.status} />
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-lg tabular-nums",
            scoreColor(trend.latest_heat_score)
          )}
        >
          🔥 {trend.latest_heat_score.toFixed(1)}
        </span>
      </div>

      {/* Label */}
      <Link
        href={`/trends/${trend.key}`}
        className="mt-3 block text-base font-semibold text-slate-900 hover:text-blue-700 transition-colors leading-snug"
      >
        {trend.label}
      </Link>

      {/* Tracking info */}
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          已追踪 {trend.occurrence_count} 期
        </span>
        <span>
          {formatDate(trend.first_seen)} — {formatDate(trend.last_seen)}
        </span>
      </div>

      {/* Domain + occurrence count */}
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
        {trend.domain && (
          <span
            className="inline-block px-2 py-0.5 rounded-md font-medium"
            style={{
              color: trend.domain.color,
              backgroundColor: `${trend.domain.color}15`,
            }}
          >
            {trend.domain.name}
          </span>
        )}
        <span className="inline-flex items-center gap-0.5">
          <Hash className="h-3.5 w-3.5" />
          关联课题 {trend.topic_count}
        </span>
      </div>

      {/* Related tags */}
      {trend.related_tags.length > 0 && (
        <TagList tags={trend.related_tags} max={3} className="mt-3" />
      )}
    </div>
  );
}
