import Link from "next/link";
import { BookOpen, TrendingUp, BarChart3 } from "lucide-react";
import { cn, momentumLabel } from "@/lib/utils";
import type { DomainListItem } from "@/lib/types";

interface DomainCardProps {
  domain: DomainListItem;
}

export default function DomainCard({ domain }: DomainCardProps) {
  return (
    <Link
      href={`/domains/${domain.slug}`}
      className={cn(
        "block bg-white rounded-xl border-l-4 p-4 transition-all",
        "hover:shadow-md hover:bg-slate-50/50"
      )}
      style={{ borderLeftColor: domain.color }}
    >
      {/* Top: icon + name + momentum */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {domain.icon && (
            <span className="text-lg leading-none">{domain.icon}</span>
          )}
          <h3 className="text-base font-semibold text-slate-900">
            {domain.name}
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          {momentumLabel(domain.momentum)}
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          课题 {domain.topic_count}
        </span>
        <span className="inline-flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          趋势 {domain.active_trend_count}
        </span>
        <span className="inline-flex items-center gap-1">
          <BarChart3 className="h-3.5 w-3.5" />
          均分 {domain.avg_score.toFixed(1)}
        </span>
      </div>
    </Link>
  );
}
