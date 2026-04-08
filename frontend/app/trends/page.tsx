import Link from "next/link";
import { getTrends } from "@/lib/api";
import { trendStatusInfo } from "@/lib/utils";

const STATUS_TABS = [
  { value: "", label: "全部" },
  { value: "rising", label: "🔥 上升" },
  { value: "emerging", label: "📈 新兴" },
  { value: "stable", label: "➡️ 稳定" },
  { value: "cooling", label: "❄️ 降温" },
];

interface Props {
  searchParams: { status?: string; page?: string };
}

export default async function TrendsPage({ searchParams }: Props) {
  const data = await getTrends({
    status: searchParams.status,
    per_page: 20,
    page: parseInt(searchParams.page || "1"),
  }).catch(() => ({ items: [], total: 0, page: 1, per_page: 20, total_pages: 0 }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">趋势雷达</h1>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/trends${tab.value ? `?status=${tab.value}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              (searchParams.status || "") === tab.value
                ? "bg-brand-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Trend List */}
      {data.items.length > 0 ? (
        <div className="space-y-3">
          {data.items.map((trend) => {
            const info = trendStatusInfo(trend.status);
            return (
              <Link
                key={trend.key}
                href={`/trends/${trend.key}`}
                className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.color}`}>
                      {info.icon} {info.label}
                    </span>
                    <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {trend.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>已追踪 {trend.occurrence_count} 期</span>
                    <span>·</span>
                    <span>{trend.first_seen} 至 {trend.last_seen}</span>
                    {trend.topic_count > 0 && (
                      <>
                        <span>·</span>
                        <span>{trend.topic_count} 篇相关研究</span>
                      </>
                    )}
                  </div>
                  {trend.related_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {trend.related_tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                {trend.domain && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0 ml-4">
                    {trend.domain.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">暂无匹配的趋势</div>
      )}
    </div>
  );
}
