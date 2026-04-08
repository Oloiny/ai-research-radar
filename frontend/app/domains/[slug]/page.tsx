import Link from "next/link";
import { notFound } from "next/navigation";
import { getDomainDetail, getResearchList, getTrends } from "@/lib/api";
import { scoreColor, trendStatusInfo, formatDate } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

export default async function DomainDetailPage({ params }: Props) {
  let domain;
  try {
    domain = await getDomainDetail(params.slug);
  } catch {
    notFound();
  }

  const [topicsData, trendsData] = await Promise.all([
    getResearchList({ domain: params.slug, per_page: 10 }).catch(() => ({ items: [], total: 0, page: 1, per_page: 10, total_pages: 0 })),
    getTrends({ domain: params.slug, per_page: 10 }).catch(() => ({ items: [], total: 0, page: 1, per_page: 10, total_pages: 0 })),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600">首页</Link>
        <span>/</span>
        <Link href="/domains" className="hover:text-slate-600">领域地图</Link>
        <span>/</span>
        <span className="text-slate-600">{domain.name}</span>
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{domain.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{domain.name}</h1>
          {domain.name_en && <p className="text-sm text-slate-400">{domain.name_en}</p>}
        </div>
      </div>
      {domain.description && <p className="text-slate-500 mb-6">{domain.description}</p>}

      <div className="flex items-center gap-6 text-sm text-slate-500 mb-8">
        <span><strong className="text-slate-900">{domain.stats.topic_count}</strong> 篇研究</span>
        <span><strong className="text-slate-900">{domain.stats.active_trend_count}</strong> 个活跃趋势</span>
        <span>均分 <strong className="text-slate-900">{domain.stats.avg_score}</strong></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topics */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">研究专题</h2>
          {topicsData.items.length > 0 ? (
            <div className="space-y-2">
              {topicsData.items.map((t) => (
                <Link
                  key={t.slug}
                  href={`/research/${t.slug}`}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{t.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{formatDate(t.batch_date)}</div>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${scoreColor(t.score_total)}`}>
                    {t.score_total}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">暂无研究</p>
          )}
        </div>

        {/* Trends */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">相关趋势</h2>
          {trendsData.items.length > 0 ? (
            <div className="space-y-2">
              {trendsData.items.map((trend) => {
                const info = trendStatusInfo(trend.status);
                return (
                  <Link
                    key={trend.key}
                    href={`/trends/${trend.key}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.color}`}>
                        {info.icon}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{trend.label}</span>
                    </div>
                    <span className="text-xs text-slate-400">{trend.occurrence_count} 期</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">暂无趋势</p>
          )}
        </div>
      </div>
    </div>
  );
}
