import Link from "next/link";
import { getLatestResearch, getTrends, getDomains } from "@/lib/api";
import { scoreColor, trendStatusInfo, momentumLabel } from "@/lib/utils";
import { ArrowRight, TrendingUp, Map, FileText } from "lucide-react";

export default async function HomePage() {
  const [researchData, trendsData, domainsData] = await Promise.all([
    getLatestResearch().catch(() => ({ items: [], total: 0, page: 1, per_page: 12, total_pages: 0 })),
    getTrends({ status: "rising", per_page: 5 }).catch(() => ({ items: [], total: 0, page: 1, per_page: 5, total_pages: 0 })),
    getDomains().catch(() => ({ items: [] })),
  ]);

  const latestTopics = researchData.items.slice(0, 3);
  const risingTrends = trendsData.items;
  const domains = domainsData.items;

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              AI 领域的
              <br />
              <span className="text-brand-500">深度研究图书馆</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 leading-relaxed">
              不是新闻聚合，是可验证的结构化研究。每篇专题都有 6 维评分、证据链、可信度标注和趋势追踪。
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1"><FileText size={14} /> 22+ 信源</span>
              <span>·</span>
              <span className="flex items-center gap-1"><TrendingUp size={14} /> 语义趋势追踪</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Map size={14} /> 6 维评分</span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Research */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">最新深度研究</h2>
          <Link href="/research" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        {latestTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/research/${topic.slug}`}
                className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 flex-1">
                    {topic.title}
                  </h3>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full shrink-0 ${scoreColor(topic.score_total)}`}>
                    {topic.score_total}
                  </span>
                </div>
                {topic.core_insight && (
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{topic.core_insight}</p>
                )}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {topic.domain && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: topic.domain.color }}>
                      {topic.domain.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{topic.evidence_count} 个证据</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">暂无研究数据，请先运行灵感推送</div>
        )}
      </section>

      {/* Rising Trends */}
      {risingTrends.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">🔥 上升中的趋势</h2>
            <Link href="/trends" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
              趋势雷达 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {risingTrends.map((trend) => {
              const info = trendStatusInfo(trend.status);
              return (
                <Link
                  key={trend.key}
                  href={`/trends/${trend.key}`}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.color}`}>
                      {info.icon} {info.label}
                    </span>
                    <span className="font-medium text-slate-900">{trend.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>已追踪 {trend.occurrence_count} 期</span>
                    {trend.domain && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100">{trend.domain.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Domain Atlas Preview */}
      {domains.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">领域全景</h2>
            <Link href="/domains" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
              探索全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {domains.filter(d => d.topic_count > 0).map((domain) => (
              <Link
                key={domain.slug}
                href={`/domains/${domain.slug}`}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all text-center"
              >
                <div className="text-2xl mb-1">{domain.icon}</div>
                <div className="text-sm font-medium text-slate-900">{domain.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {domain.topic_count} 篇研究 · {domain.active_trend_count} 个趋势
                </div>
                <div className="text-xs mt-1">{momentumLabel(domain.momentum)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
