import Link from "next/link";
import { getResearchList, getDomains } from "@/lib/api";
import { scoreColor, formatDate } from "@/lib/utils";

interface Props {
  searchParams: { domain?: string; tag?: string; sort?: string; page?: string };
}

export default async function ResearchListPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || "1");
  const [data, domainsData] = await Promise.all([
    getResearchList({
      domain: searchParams.domain,
      tag: searchParams.tag,
      sort: (searchParams.sort as "newest" | "score") || "newest",
      page,
      per_page: 12,
    }).catch(() => ({ items: [], total: 0, page: 1, per_page: 12, total_pages: 0 })),
    getDomains().catch(() => ({ items: [] })),
  ]);

  const domains = domainsData.items;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">深度研究</h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          href="/research"
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            !searchParams.domain ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          全部
        </Link>
        {domains.map((d) => (
          <Link
            key={d.slug}
            href={`/research?domain=${d.slug}${searchParams.sort ? `&sort=${searchParams.sort}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              searchParams.domain === d.slug
                ? "bg-brand-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {d.icon} {d.name}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/research?${searchParams.domain ? `domain=${searchParams.domain}&` : ""}sort=newest`}
            className={`text-xs px-3 py-1.5 rounded-full ${searchParams.sort !== "score" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            最新
          </Link>
          <Link
            href={`/research?${searchParams.domain ? `domain=${searchParams.domain}&` : ""}sort=score`}
            className={`text-xs px-3 py-1.5 rounded-full ${searchParams.sort === "score" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            评分
          </Link>
        </div>
      </div>

      {/* Topic Grid */}
      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items.map((topic) => (
            <Link
              key={topic.slug}
              href={`/research/${topic.slug}`}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors flex-1 line-clamp-2">
                  {topic.title}
                </h3>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full shrink-0 ${scoreColor(topic.score_total)}`}>
                  {topic.score_total}
                </span>
              </div>
              {topic.core_insight && (
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{topic.core_insight}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                {topic.domain && (
                  <span className="px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: topic.domain.color }}>
                    {topic.domain.name}
                  </span>
                )}
                <span>{formatDate(topic.batch_date)}</span>
                <span>·</span>
                <span>{topic.evidence_count} 个证据</span>
                {topic.trend_count > 0 && <span>· {topic.trend_count} 个趋势</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {topic.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">暂无匹配的研究</div>
      )}

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/research?${searchParams.domain ? `domain=${searchParams.domain}&` : ""}${searchParams.sort ? `sort=${searchParams.sort}&` : ""}page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                p === page ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
