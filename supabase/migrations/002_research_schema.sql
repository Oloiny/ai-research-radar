-- 002_research_schema.sql
-- AI Research Radar — 公开研究平台扩展表
-- 与 001 的内部管线表共存，不修改任何已有表

-- ============================================================
-- 1. domains — 领域分类
-- ============================================================
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#4F6EF7',
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_domains_slug ON domains(slug);

-- ============================================================
-- 2. research_topics — 公开的深度研究专题（核心表）
-- ============================================================
CREATE TABLE research_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,

    -- 6 维评分
    score_total NUMERIC(3,1) NOT NULL CHECK (score_total BETWEEN 6.0 AND 9.5),
    score_timeliness NUMERIC(2,1) NOT NULL DEFAULT 0,
    score_implementability NUMERIC(2,1) NOT NULL DEFAULT 0,
    score_impact NUMERIC(2,1) NOT NULL DEFAULT 0,
    score_material_richness NUMERIC(2,1) NOT NULL DEFAULT 0,
    score_actionability NUMERIC(2,1) NOT NULL DEFAULT 0,
    score_innovation NUMERIC(2,1) NOT NULL DEFAULT 0,
    score_trend_bonus NUMERIC(2,1) NOT NULL DEFAULT 0,

    credibility_note TEXT,
    research_direction TEXT,
    core_insight TEXT,
    signal_window TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',

    -- 关联
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    batch_date DATE NOT NULL,
    rank_in_batch INTEGER,

    -- 全文搜索向量
    search_vector tsvector,

    -- 回溯内部管线（可选）
    source_topic_candidate_id UUID REFERENCES topic_candidates(id) ON DELETE SET NULL,

    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_research_topics_slug ON research_topics(slug);
CREATE INDEX idx_research_topics_domain ON research_topics(domain_id);
CREATE INDEX idx_research_topics_batch ON research_topics(batch_date DESC);
CREATE INDEX idx_research_topics_score ON research_topics(score_total DESC);
CREATE INDEX idx_research_topics_status ON research_topics(status) WHERE status = 'published';
CREATE INDEX idx_research_topics_tags ON research_topics USING GIN(tags);
CREATE INDEX idx_research_topics_search ON research_topics USING GIN(search_vector);
CREATE INDEX idx_research_topics_published_at ON research_topics(published_at DESC);

-- 自动维护搜索向量 + updated_at
CREATE OR REPLACE FUNCTION research_topics_search_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.core_insight, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.body, '')), 'B') ||
        setweight(to_tsvector('simple', array_to_string(COALESCE(NEW.tags, '{}'), ' ')), 'B');
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_research_topics_search
    BEFORE INSERT OR UPDATE ON research_topics
    FOR EACH ROW EXECUTE FUNCTION research_topics_search_update();

-- ============================================================
-- 3. topic_evidence — 证据链（专题 ↔ 信号，多对多）
-- ============================================================
CREATE TABLE topic_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES research_topics(id) ON DELETE CASCADE,
    signal_id UUID REFERENCES raw_signals(id) ON DELETE SET NULL,

    signal_title TEXT NOT NULL,
    signal_url TEXT,
    signal_source TEXT,
    signal_date DATE,

    quote TEXT,
    credibility TEXT NOT NULL DEFAULT '标题推断'
        CHECK (credibility IN ('原文已读', '原文已读·多源', '标题推断', '二手引用')),
    relevance_note TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topic_evidence_topic ON topic_evidence(topic_id);
CREATE INDEX idx_topic_evidence_signal ON topic_evidence(signal_id);

-- ============================================================
-- 4. trends — 趋势追踪（替代 trend_memory.json）
-- ============================================================
CREATE TABLE trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    label_en TEXT,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'emerging'
        CHECK (status IN ('emerging', 'rising', 'stable', 'cooling', 'dormant')),

    first_seen DATE NOT NULL,
    last_seen DATE NOT NULL,
    occurrence_count INTEGER NOT NULL DEFAULT 1,

    related_tags TEXT[] NOT NULL DEFAULT '{}',
    recent_titles TEXT[] NOT NULL DEFAULT '{}',

    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trends_key ON trends(key);
CREATE INDEX idx_trends_status ON trends(status);
CREATE INDEX idx_trends_domain ON trends(domain_id);
CREATE INDEX idx_trends_last_seen ON trends(last_seen DESC);

-- ============================================================
-- 5. trend_snapshots — 趋势时间序列（画热度曲线）
-- ============================================================
CREATE TABLE trend_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,

    signal_count INTEGER NOT NULL DEFAULT 0,
    topic_count INTEGER NOT NULL DEFAULT 0,
    heat_score NUMERIC(4,1) NOT NULL DEFAULT 0,

    milestone_title TEXT,
    milestone_type TEXT CHECK (
        milestone_type IS NULL OR
        milestone_type IN ('breakthrough', 'release', 'funding', 'incident', 'policy')
    ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(trend_id, snapshot_date)
);

CREATE INDEX idx_trend_snapshots_trend_date ON trend_snapshots(trend_id, snapshot_date DESC);

-- ============================================================
-- 6. topic_trends — 专题 ↔ 趋势关联（多对多）
-- ============================================================
CREATE TABLE topic_trends (
    topic_id UUID NOT NULL REFERENCES research_topics(id) ON DELETE CASCADE,
    trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
    PRIMARY KEY (topic_id, trend_id)
);

CREATE INDEX idx_topic_trends_trend ON topic_trends(trend_id);
