-- 001_initial_schema.sql
-- Topic Radar Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Data sources configured for collection
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('rss', 'api')),
    url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('gaming_news', 'ai_research', 'funding')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    fetch_interval_hours INTEGER NOT NULL DEFAULT 6,
    last_fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Raw signals collected from sources
CREATE TABLE raw_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,        -- URL or arXiv ID for dedup
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_processed BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(source_id, external_id)
);

CREATE INDEX idx_raw_signals_is_processed ON raw_signals(is_processed);
CREATE INDEX idx_raw_signals_source_collected ON raw_signals(source_id, collected_at DESC);
CREATE INDEX idx_raw_signals_published ON raw_signals(published_at DESC);

-- Each Claude analysis run
CREATE TABLE analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    triggered_by TEXT NOT NULL DEFAULT 'scheduler',  -- 'scheduler' | 'manual'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    signals_count INTEGER,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Claude-generated topic candidates
CREATE TABLE topic_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 5),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    strategic_relevance_score NUMERIC(3,1) NOT NULL CHECK (strategic_relevance_score BETWEEN 1 AND 10),
    signal_strength_data JSONB NOT NULL DEFAULT '{}',  -- {trend, contributing_urls, growth_pct}
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_novel BOOLEAN NOT NULL DEFAULT true,
    vote_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'selected', 'archived')),
    strategic_rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topic_candidates_run_rank ON topic_candidates(run_id, rank);
CREATE INDEX idx_topic_candidates_status ON topic_candidates(status);

-- Per-voter votes (one vote per voter per topic)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topic_candidates(id) ON DELETE CASCADE,
    voter_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(topic_id, voter_id)
);

CREATE INDEX idx_votes_topic ON votes(topic_id);

-- Historical published topics
CREATE TABLE published_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    published_week DATE NOT NULL,       -- Monday of the week
    report_url TEXT,
    source_topic_id UUID REFERENCES topic_candidates(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_published_topics_week ON published_topics(published_week DESC);

-- Function to keep vote_count in sync
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE topic_candidates SET vote_count = vote_count + 1 WHERE id = NEW.topic_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE topic_candidates SET vote_count = vote_count - 1 WHERE id = OLD.topic_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vote_count
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_vote_count();
