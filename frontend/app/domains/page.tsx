import Link from "next/link";
import { getDomains } from "@/lib/api";
import { momentumLabel } from "@/lib/utils";

export default async function DomainsPage() {
  const data = await getDomains().catch(() => ({ items: [] }));
  const domains = data.items;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">领域全景</h1>
      <p className="text-slate-500 mb-8">AI 各方向的研究密度、趋势活跃度和发展动量一览</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => (
          <Link
            key={domain.slug}
            href={`/domains/${domain.slug}`}
            className="group bg-white rounded-xl border-l-4 border border-slate-200 p-5 hover:shadow-md transition-all"
            style={{ borderLeftColor: domain.color }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{domain.icon}</span>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {domain.name}
                </h3>
                {domain.name_en && (
                  <p className="text-xs text-slate-400">{domain.name_en}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-slate-900">{domain.topic_count}</div>
                <div className="text-xs text-slate-400">篇研究</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{domain.active_trend_count}</div>
                <div className="text-xs text-slate-400">个趋势</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{domain.avg_score || "-"}</div>
                <div className="text-xs text-slate-400">均分</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-center">{momentumLabel(domain.momentum)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
