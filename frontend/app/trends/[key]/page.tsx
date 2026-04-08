import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrendDetail } from "@/lib/api";
import { trendStatusInfo, scoreColor, formatDate } from "@/lib/utils";
import TrendHeatCurve from "@/components/charts/TrendHeatCurve";

interface Props {
  params: { key: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const trend = await getTrendDetail(params.key);
    return {
      title: `${trend.label} — 趋势追踪 | AI Research Radar`,
      description: trend.description || `AI 趋势追踪：${trend.label}，已追踪 ${trend.occurrence_count} 期`,
    };
  } catch {
    return { title: "趋势详情 | AI Research Radar" };
  }
}

export default async function TrendDetailPage({ params }: Props) {
  let trend;
  try {
    trend = await getTrendDetail(params.key);
  } catch {
    notFound();
  }

  const info = trendStatusInfo(trend.status);
  const milestones = trend.heat_curve.filter((p) => p.milestone);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600">首页</Link>
        <span>/</span>
        <Link href="/trends" className="hover:text-slate-600">趋势雷达</Link>
        <span>/</span>
        <span className="text-slate-600">{trend.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${info.color}`}>
            {info.icon} {info.label}
          </span>
          {trend.domain && (
            <Link
              href={`/domains/${trend.domain.slug}`}
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: trend.domain.color }}
            >
              {trend.domain.name}
            </Link>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{trend.label}</h1>
        {trend.label_en && (
          <p className="text-sm text-slate-400 mt-1">{trend.label_en}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-slate-400 mt-3">
          <span>首次发现 {trend.first_seen}</span>
          <span>·</span>
          <span>已追踪 {trend.occurrence_count} 期</span>
          <span>·</span>
          <span>最近 {trend.last_seen}</span>
        </div>
      </div>

      {/* Heat Curve */}
      {trend.heat_curve.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">热度演化</h2>
          <TrendHeatCurve data={trend.heat_curve} height={280} showMilestones />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Milestones */}
        <div className="lg:col-span-2">
          {milestones.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">关键节点</h2>
              <div className="relative pl-6 border-l-2 border-brand-200 space-y-4">
                {milestones.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[1.6rem] w-3 h-3 rounded-full bg-brand-500 border-2 border-white" />
                    <div className="text-xs text-slate-400 mb-1">{formatDate(m.date)}</div>
                    <div className="text-sm font-medium text-slate-800">{m.milestone?.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">热度 {m.heat} · {m.signal_count} 条信号</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Topics */}
          {trend.related_topics.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">相关研究</h2>
              <div className="space-y-2">
                {trend.related_topics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/research/${t.slug}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800">{t.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatDate(t.batch_date)}</div>
                    </div>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${scoreColor(t.score_total)}`}>
                      {t.score_total}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {trend.related_tags.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">关联标签</h3>
              <div className="flex flex-wrap gap-1.5">
                {trend.related_tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Titles */}
          {trend.recent_titles.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">近期专题标题</h3>
              <ul className="space-y-2">
                {trend.recent_titles.map((title, i) => (
                  <li key={i} className="text-sm text-slate-600 leading-snug">· {title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
