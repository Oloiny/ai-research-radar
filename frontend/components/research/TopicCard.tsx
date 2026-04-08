import Link from "next/link";
import { FileText, TrendingUp } from "lucide-react";
import {
  cn,
  scoreBorderColor,
  formatDate,
  truncate,
} from "@/lib/utils";
import type { ResearchListItem } from "@/lib/types";
import ScoreBadge from "@/components/shared/ScoreBadge";
import TagList from "@/components/shared/TagList";

interface TopicCardProps {
  topic: ResearchListItem;
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <div
      className={cn(
        "relative bg-white rounded-xl border p-5 transition-all",
        "hover:shadow-md hover:border-slate-300",
        scoreBorderColor(topic.score_total)
      )}
    >
      {/* Score badge — top right */}
      <div className="absolute top-4 right-4">
        <ScoreBadge score={topic.score_total} />
      </div>

      {/* Title */}
      <Link
        href={`/research/${topic.slug}`}
        className="block pr-14 text-base font-semibold text-slate-900 hover:text-blue-700 transition-colors leading-snug"
      >
        {topic.title}
      </Link>

      {/* Core insight */}
      {topic.core_insight && (
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {truncate(topic.core_insight, 120)}
        </p>
      )}

      {/* Tags */}
      {topic.tags.length > 0 && (
        <TagList tags={topic.tags} max={4} className="mt-3" />
      )}

      {/* Footer: domain, date, counters */}
      <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
        {topic.domain && (
          <span
            className="inline-block px-2 py-0.5 rounded-md font-medium"
            style={{
              color: topic.domain.color,
              backgroundColor: `${topic.domain.color}15`,
            }}
          >
            {topic.domain.name}
          </span>
        )}

        <span>{formatDate(topic.batch_date)}</span>

        <span className="inline-flex items-center gap-0.5">
          <FileText className="h-3.5 w-3.5" />
          {topic.evidence_count}
        </span>

        <span className="inline-flex items-center gap-0.5">
          <TrendingUp className="h-3.5 w-3.5" />
          {topic.trend_count}
        </span>
      </div>
    </div>
  );
}
