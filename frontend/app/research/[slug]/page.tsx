import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResearchDetail } from "@/lib/api";
import { formatDate, scoreColor, trendStatusInfo } from "@/lib/utils";
import ScoreRadarChart from "@/components/charts/ScoreRadarChart";
import ScoreBreakdownBar from "@/components/research/ScoreBreakdownBar";
import EvidenceChain from "@/components/research/EvidenceChain";
import ResearchDirection from "@/components/research/ResearchDirection";
import RelatedTopics from "@/components/research/RelatedTopics";
import MiniHeatCurve from "@/components/charts/MiniHeatCurve";
import ShareButton from "@/components/research/ShareButton";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const topic = await getResearchDetail(params.slug);
    return {
      title: `${topic.title} | AI Research Radar`,
      description: topic.core_insight || topic.body.slice(0, 160),
      openGraph: {
        title: topic.title,
        description: topic.core_insight || undefined,
        type: "article",
        publishedTime: topic.published_at || undefined,
      },
    };
  } catch {
    return { title: "研究详情 | AI Research Radar" };
  }
}

export default async function ResearchDetailPage({ params }: Props) {
  let topic;
  try {
    topic = await getResearchDetail(params.slug);
  } catch {
    notFound();
  }

  const paragraphs = topic.body.split("\n").filter((p) => p.trim());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600">首页</Link>
        <span>/</span>
        <Link href="/research" className="hover:text-slate-600">深度研究</Link>
        <span>/</span>
        <span className="text-slate-600 truncate max-w-xs">{topic.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {topic.title}
          </h1>
          <span className={`text-xl font-bold px-3 py-1 rounded-full shrink-0 ${scoreColor(topic.score_total)}`}>
            {topic.score_total}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span>{formatDate(topic.batch_date)}</span>
          {topic.domain && (
            <Link
              href={`/domains/${topic.domain.slug}`}
              className="px-2 py-0.5 rounded-full text-xs text-white"
              style={{ backgroundColor: topic.domain.color }}
            >
              {topic.domain.name}
            </Link>
          )}
          <span>{topic.evidence.length} 个证据源</span>
          {topic.linked_trends.length > 0 && (
            <span>{topic.linked_trends.length} 个关联趋势</span>
          )}
          <div className="ml-auto">
            <ShareButton />
          </div>
        </div>
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Radar Chart + Core Insight */}
          <div className="flex flex-col sm:flex-row items-start gap-6 p-6 bg-white rounded-xl border border-slate-200">
            <ScoreRadarChart breakdown={topic.score_breakdown} size={200} />
            <div className="flex-1">
              {topic.core_insight && (
                <div className="mb-4">
                  <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">核心判断</span>
                  <p className="mt-1 text-base font-medium text-slate-900 leading-relaxed">
                    {topic.core_insight}
                  </p>
                </div>
              )}
              {topic.signal_window && (
                <p className="text-xs text-slate-400">信号窗口: {topic.signal_window}</p>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="prose-research">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Research Direction */}
          {topic.research_direction && (
            <ResearchDirection direction={topic.research_direction} />
          )}

          {/* Evidence Chain */}
          <EvidenceChain evidence={topic.evidence} />

          {/* Related Topics */}
          <RelatedTopics topics={topic.related_topics} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">评分明细</h3>
            <ScoreBreakdownBar breakdown={topic.score_breakdown} total={topic.score_total} />
          </div>

          {/* Linked Trends */}
          {topic.linked_trends.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">关联趋势</h3>
              {topic.linked_trends.map((trend) => {
                const info = trendStatusInfo(trend.status);
                return (
                  <Link
                    key={trend.key}
                    href={`/trends/${trend.key}`}
                    className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800">{trend.label}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${info.color}`}>
                        {info.icon} {info.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">已追踪 {trend.occurrence_count} 期</span>
                      <MiniHeatCurve data={trend.mini_heat_curve} width={60} height={20} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {topic.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">标签</h3>
              <div className="flex flex-wrap gap-1.5">
                {topic.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/research?tag=${encodeURIComponent(tag)}`}
                    className="text-xs bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 px-2 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Credibility Note */}
          {topic.credibility_note && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">可信度说明</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{topic.credibility_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
