import Link from "next/link";
import type { RelatedTopic } from "@/lib/types";
import { scoreColor } from "@/lib/utils";

interface Props {
  topics: RelatedTopic[];
}

export default function RelatedTopics({ topics }: Props) {
  if (!topics.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <span className="w-1 h-4 bg-slate-300 rounded-full" />
        相关研究
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {topics.map((t) => (
          <Link
            key={t.slug}
            href={`/research/${t.slug}`}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <span className="text-sm text-slate-700 group-hover:text-slate-900 line-clamp-1 flex-1">
              {t.title}
            </span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${scoreColor(t.score_total)}`}>
              {t.score_total}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
