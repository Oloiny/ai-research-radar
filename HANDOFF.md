# AI Research Radar — 完整交接文档

> 这份文档是从另一个 AI Agent（Claude Code）交接给你的。包含项目的所有背景、设计意图、当前状态和待办事项。

---

## 一、项目是什么

**AI Research Radar** 是一个面向公众的 AI 领域深度研究网站（未来还会有小程序）。

**核心定位**：不是新闻聚合器，是**"AI 领域的活的研究图书馆"**。用户来这里不是看"今天AI发生了什么"，而是**"搞清楚某个AI方向到底怎么回事、值不值得投入"**。

**对标竞品**：
- CB Insights（$2万+/年的企业研究平台）的**平价版**
- Exploding Topics（趋势追踪）的**AI垂直深度版**
- Papers With Code（2025年7月已关闭）的**精神续作**

**核心差异化**（别人都没有的）：
1. **6维评分体系** — 每篇研究都有量化评分（时效性/实操性/影响力/材料丰富度/可行动性/创新性），用户一眼判断值不值得深入
2. **证据链+可信度标注** — 每条证据标注"原文已读"或"标题推断"，点击可跳原文。竞品都是"据悉"
3. **语义趋势追踪** — 不是关键词频率，是AI理解的趋势演化（"多Agent"="multi-agent"="多智能体"被视为同一趋势）
4. **研究方向建议** — 每篇给出"所以你该关注什么"的具体建议，不只说发生了什么

---

## 二、技术架构

```
┌── 数据生产（在另一台机器上由 Claude Code 完成）──────────┐
│                                                         │
│  每周 1-2 次运行 /灵感推送：                              │
│  信号采集(22+信源) → 精炼 → 专题分析(Agent多轮推理)       │
│  → 输出 topics.json + trend_memory.json                  │
│  → 推到 GitHub                                           │
│                                                         │
└────────────────────────────┬────────────────────────────┘
                             │ git pull + 导入脚本
                             ▼
┌── 你的服务器（Docker Compose）────────────────────────────┐
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐              │
│  │PostgreSQL │←→│ FastAPI  │←→│ Next.js   │←→ 用户浏览器  │
│  │  数据库   │  │ 后端API  │  │ 前端SSR   │              │
│  └──────────┘  └──────────┘  └───────────┘              │
│                                                          │
│  ┌──────────┐  ┌──────────┐                              │
│  │  Nginx   │  │ Collector│ ← 每12h自动爬信号(纯爬虫)     │
│  └──────────┘  └──────────┘                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**技术栈**：Next.js 14 (App Router) + FastAPI + PostgreSQL + Docker Compose + Nginx

**不需要LLM API**：所有需要智能分析的工作由 Claude Code 完成后推到 GitHub。这个网站只做数据展示。

---

## 三、数据库设计

### 原有表（6张，来自内部管线，仍保留用于信号采集）
- `data_sources` — 信源配置
- `raw_signals` — 原始信号
- `analysis_runs` — 分析运行记录
- `topic_candidates` — 内部候选专题
- `votes` — 投票
- `published_topics` — 已发布专题

### 新增表（5张+1关联表，面向公开网站）
- **`domains`** — 11个AI领域分类（Agent生态、AI视频、AI编程、AI安全、AI基础设施、世界模型、具身智能、AI×游戏、AI商业模式、AI地缘政治、AI研究前沿）
- **`research_topics`** — 核心表，每篇深度研究专题，含6维评分、正文、证据链、研究方向建议、全文搜索向量
- **`topic_evidence`** — 证据链，多对多关联专题和信号
- **`trends`** — 趋势追踪，替代原来的 trend_memory.json
- **`trend_snapshots`** — 趋势时间序列数据（画热度曲线）
- **`topic_trends`** — 专题↔趋势多对多关联

详细 schema 见 `supabase/migrations/002_research_schema.sql`

---

## 四、API 设计

### 研究专题 API
| 端点 | 说明 |
|------|------|
| `GET /api/v1/research` | 列表，支持 domain/tag/date/score 筛选，分页 |
| `GET /api/v1/research/latest` | 最新一批专题 |
| `GET /api/v1/research/{slug}` | 完整详情（含证据链+趋势关联+相关专题） |

### 趋势 API
| 端点 | 说明 |
|------|------|
| `GET /api/v1/trends` | 列表，支持 status/domain 筛选 |
| `GET /api/v1/trends/{key}` | 详情（含热度曲线+里程碑+关联专题） |

### 领域 API
| 端点 | 说明 |
|------|------|
| `GET /api/v1/domains` | 所有领域（含统计+动量计算） |
| `GET /api/v1/domains/{slug}` | 领域详情 |

### 搜索 API
| 端点 | 说明 |
|------|------|
| `GET /api/v1/search?q=xxx` | PostgreSQL 全文搜索 |

---

## 五、前端页面结构

| 路由 | 功能 | 状态 |
|------|------|------|
| `/` | 首页：最新专题 + 热门趋势 + 领域全景 | 已实现，需优化设计 |
| `/research` | 研究列表 + 领域筛选 + 排序 | 已实现，需优化设计 |
| `/research/[slug]` | **核心页面**：6维雷达图 + 正文 + 证据链 + 趋势关联 + 研究方向 | 已实现，需优化设计 |
| `/trends` | 趋势雷达列表 + 状态筛选 | 已实现，需优化设计 |
| `/trends/[key]` | 趋势详情：热度曲线 + 里程碑时间线 | 已实现，需优化设计 |
| `/domains` | 领域地图 | 已实现，需优化设计 |
| `/domains/[slug]` | 领域详情 | 已实现，需优化设计 |
| `/about` | 方法论说明（评分体系、可信度、信源） | 已实现，需优化设计 |

### 组件清单

**图表组件** (`components/charts/`)：
- `ScoreRadarChart.tsx` — 6维评分雷达图（Recharts）
- `TrendHeatCurve.tsx` — 趋势热度曲线（里程碑标记）
- `MiniHeatCurve.tsx` — 迷你sparkline

**研究组件** (`components/research/`)：
- `TopicCard.tsx` — 专题卡片
- `ScoreBreakdownBar.tsx` — 评分条形展开
- `EvidenceChain.tsx` — 证据链（可信度徽章）
- `ResearchDirection.tsx` — 研究方向建议框
- `RelatedTopics.tsx` — 相关专题
- `ShareButton.tsx` — 复制链接

**趋势组件** (`components/trends/`)：
- `TrendCard.tsx`, `TrendMiniCard.tsx`, `TrendStatusBadge.tsx`

**领域组件** (`components/domains/`)：
- `DomainCard.tsx`

**通用组件** (`components/shared/`)：
- `ScoreBadge.tsx`, `CredibilityBadge.tsx`, `TagList.tsx`, `Pagination.tsx`, `FilterBar.tsx`

---

## 六、设计意图和参考

### 整体风格
想要的感觉是**研究机构 + 数据产品**的结合：
- 类似 CB Insights 的研究报告感（专业、可信、数据驱动）
- 类似 Exploding Topics 的趋势追踪感（简洁、动态、可视化）
- **不要**像36kr/量子位那样的新闻流

### 核心设计理念
1. **阅读体验优先** — 专题详情页是核心，需要好的排版和长文阅读体验
2. **数据可视化** — 雷达图、热度曲线、领域气泡图不是装饰，是核心信息载体
3. **可信度透明** — 证据链和可信度标注是最大差异化，UI要突出
4. **移动端友好** — 很多人会在手机上看

### `/research/[slug]` 详情页设计意图

这是最重要的页面。布局设计：

```
┌─────────────────────────────────────────────────┐
│ 面包屑 · 标题 · 评分 · 元信息 · [分享]           │
├──────────────────────┬──────────────────────────┤
│ 主内容                │ 侧边栏                   │
│ [6维雷达图+核心判断]   │ [评分明细条形图]           │
│ 正文（150-250字分析） │ [关联趋势+迷你热度曲线]    │
│ [研究方向建议框]       │ [标签云]                  │
│ [证据链列表]          │ [可信度说明]               │
├──────────────────────┴──────────────────────────┤
│ 相关专题横向卡片                                  │
└─────────────────────────────────────────────────┘
```

### 证据链UI设计意图
```
✅ 原文已读
├─ Stripe 发布 Agent 六层架构白皮书
│  "从 Tooling→Orchestration→Guardrails 的完整分层"
│  → stripe.com/blog/...    2026-04-05    [原文 ↗]

⚠️ 标题推断
├─ OpenClaw 开源 Agent 框架发布
│  → github.com/...         2026-04-06    [原文 ↗]
```

### 趋势热度曲线设计意图
```
热度 ↑
  │          ╭─╮
  │       ╭──╯ ╰──╮     📌 里程碑标记
  │    ╭──╯        ╰──╮
  │ ╭──╯
  └─────────────────────→ 时间
```
里程碑用橙色圆点标记，hover 显示事件名。

---

## 七、当前状态

### 已完成
- [x] 数据库 schema 设计 + migration SQL
- [x] 后端 API（4组8个端点）
- [x] 前端所有页面和组件（代码层面完成）
- [x] Docker Compose 部署配置
- [x] 服务器部署（5个容器运行中）
- [x] 数据导入脚本
- [x] 信号采集自动化（cron 每12h）

### 需要做的

#### 🔴 紧急：设计和样式优化
现在的页面是"能跑"的状态，但设计还比较粗糙。需要：
1. **整体视觉升级** — 当前太素了，需要更专业的研究产品感
2. **排版优化** — 特别是 `/research/[slug]` 详情页的长文阅读体验
3. **移动端适配** — 检查所有页面在手机上的表现
4. **加载状态** — loading skeleton、空状态、错误边界
5. **首页** — 需要更有吸引力的 hero section

#### 🟡 功能完善
1. **数据导入验证** — 运行 seed + import 脚本，确认数据正确显示
2. **搜索功能测试** — 验证中文全文搜索是否正常工作
3. **SEO** — 验证 OpenGraph 标签（用 opengraph.xyz 测试）
4. **HTTPS** — 用 certbot 加 SSL（如果有域名）

#### 🟢 未来规划
1. **Phase 2** — 小程序（Taro/React）
2. **Phase 3** — 个性化订阅、邮件周报
3. **Phase 4** — 对话式研究（接 LLM API）

---

## 八、数据更新流程

```
Claude Code（别的机器）每周跑 /灵感推送
  → 生成 topics.json + trend_memory.json
  → git push 到这个仓库

你需要做的：
  → git pull
  → docker compose exec backend python scripts/import_topics_json.py
  → docker compose exec backend python scripts/import_trend_memory.py
  → 网站自动更新

或者更好的方式：设一个 GitHub Actions webhook，push 后自动触发导入。
```

---

## 九、6维评分体系详解（产品理解需要）

**基础分 6.0**，各维度加分后硬顶 9.5：

| 维度 | 范围 | 含义 |
|------|------|------|
| 时效性 | 0-1.0 | 7天内=1.0, 8-14天=0.5, 更早=0 |
| 实操性 | 0-1.0 | 有可用产品/API=1.0, 纯理论=0 |
| 影响力 | 0-1.0 | 头部公司/现象级=1.0 |
| 材料丰富度 | 0-0.3 | 有详细数据案例=0.3 |
| 可行动性 | 0-0.3 | 读完能做决策=0.3 |
| 创新性 | 0-0.3 | 首次出现=0.3 |
| 趋势加成 | 0-0.3 | 跨周期持续出现=0.2-0.3 |

**可信度标注**：
- ✅ **原文已读** — 已读全文，可引用具体数据
- ✅ **原文已读·多源** — 多个来源交叉验证
- ⚠️ **标题推断** — 仅从标题推断，用描述性语言

---

## 十、关键文件索引

```
ai-research-radar/
├── backend/
│   ├── main.py                 ← FastAPI 入口
│   ├── config.py               ← 环境变量配置
│   ├── database.py             ← SQLAlchemy 连接
│   ├── api/
│   │   ├── research/router.py  ← 研究专题 API
│   │   ├── trends/router.py    ← 趋势 API
│   │   ├── domains/router.py   ← 领域 API
│   │   └── search/router.py    ← 搜索 API
│   ├── models/                 ← 所有 SQLAlchemy 模型
│   └── scripts/                ← 种子数据 + 导入脚本
├── frontend/
│   ├── app/                    ← Next.js 页面
│   ├── components/             ← React 组件
│   └── lib/                    ← API 客户端 + 类型 + 工具函数
├── deploy/                     ← Docker 部署配置
├── supabase/migrations/        ← SQL 建表语句
├── collect_signals.py          ← 信号采集脚本（22+信源）
├── docker-compose.yml          ← 一键部署
├── workspace/topics.json       ← 最新专题数据（9篇）
├── trend_memory.json           ← 趋势记忆（20条）
└── DEPLOY.md                   ← 部署步骤
```
