export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">方法论</h1>

      <div className="prose-research space-y-8">
        {/* Scoring System */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">6 维评分体系</h2>
          <p>每篇研究专题都经过 6 个维度的量化评估，最终得分范围 6.0–9.5：</p>
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">第一梯队（各 0–1.0 分）</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li><strong>时效性</strong> — 7 天内 1.0 分，8-14 天 0.5 分，更早 0 分</li>
                <li><strong>实操性</strong> — 有可用产品/API 1.0 分，纯理论 0 分</li>
                <li><strong>影响力</strong> — 头部公司/现象级传播 1.0 分</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">第二梯队（各 0–0.3 分）</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                <li><strong>材料丰富度</strong> — 是否有详细数据和案例</li>
                <li><strong>可行动性</strong> — 读完能否做决策</li>
                <li><strong>创新性</strong> — 是否首次出现</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">趋势加成（0–0.3 分）</h3>
              <p className="text-sm text-slate-600">
                如果该方向在趋势记忆中已出现多次并有新进展，额外加 0.2–0.3 分。硬顶 9.5 分。
              </p>
            </div>
          </div>
        </section>

        {/* Credibility */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">可信度标注系统</h2>
          <p>每条证据都标注信息获取方式：</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-sm">✅</span>
              <div>
                <div className="text-sm font-medium text-emerald-800">原文已读</div>
                <div className="text-xs text-emerald-600">已阅读原文全文，可引用具体数据和日期</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-sm">⚠️</span>
              <div>
                <div className="text-sm font-medium text-amber-800">标题推断</div>
                <div className="text-xs text-amber-600">仅从标题和摘要推断，使用描述性语言</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trend Tracking */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">语义趋势追踪</h2>
          <p>
            系统维护一个跨周期的趋势记忆库。不是简单的关键词匹配——
            &ldquo;多Agent&rdquo;、&ldquo;multi-agent&rdquo;、&ldquo;多智能体&rdquo; 会被理解为同一趋势。
          </p>
          <p>
            趋势状态由出现频率和时间间隔自动计算：新兴 → 上升 → 稳定 → 降温 → 沉寂。
            超过 60 天未出现的趋势自动归档。
          </p>
        </section>

        {/* Data Sources */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">数据信源</h2>
          <p>系统从 22+ 个信源并行采集信号，覆盖：</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-medium text-slate-900 mb-1">学术研究</div>
              arXiv cs.AI、Import AI、The Batch
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-medium text-slate-900 mb-1">科技企业</div>
              OpenAI、Google AI、NVIDIA、AWS、Hugging Face
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-medium text-slate-900 mb-1">游戏行业</div>
              Game Developer、Unity、Unreal Engine、GameDiscoverCo
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-medium text-slate-900 mb-1">社区与媒体</div>
              Hacker News、Product Hunt、VentureBeat、MIT Tech Review
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
