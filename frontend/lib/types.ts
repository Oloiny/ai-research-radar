// ============================================================
// AI Research Radar — TypeScript Interfaces
// ============================================================

// --- Score ---
export interface ScoreBreakdown {
  timeliness: number;
  implementability: number;
  impact: number;
  material_richness: number;
  actionability: number;
  innovation: number;
  trend_bonus: number;
}

// --- Domain ---
export interface DomainBrief {
  slug: string;
  name: string;
  color: string;
}

export interface DomainListItem extends DomainBrief {
  name_en?: string;
  icon?: string;
  signal_count: number;
  topic_count: number;
  active_trend_count: number;
  avg_score: number;
  latest_topic_date?: string;
  momentum: "rising" | "stable" | "cooling";
}

export interface DomainDetail extends DomainListItem {
  description?: string;
  stats: {
    topic_count: number;
    active_trend_count: number;
    avg_score: number;
  };
}

// --- Research Topic ---
export interface ResearchListItem {
  id: string;
  slug: string;
  title: string;
  core_insight?: string;
  score_total: number;
  score_breakdown: ScoreBreakdown;
  tags: string[];
  domain?: DomainBrief;
  batch_date: string;
  evidence_count: number;
  trend_count: number;
  published_at?: string;
}

export interface EvidenceItem {
  id: string;
  signal_title: string;
  signal_url?: string;
  signal_source?: string;
  signal_date?: string;
  quote?: string;
  credibility: "原文已读" | "原文已读·多源" | "标题推断" | "二手引用";
}

export interface MiniHeatPoint {
  date: string;
  heat: number;
}

export interface LinkedTrend {
  key: string;
  label: string;
  status: string;
  occurrence_count: number;
  latest_heat_score: number;
  mini_heat_curve: MiniHeatPoint[];
}

export interface RelatedTopic {
  slug: string;
  title: string;
  score_total: number;
  batch_date: string;
}

export interface ResearchDetail extends ResearchListItem {
  body: string;
  credibility_note?: string;
  research_direction?: string;
  signal_window?: string;
  evidence: EvidenceItem[];
  linked_trends: LinkedTrend[];
  related_topics: RelatedTopic[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// --- Trend ---
export interface TrendListItem {
  key: string;
  label: string;
  status: "emerging" | "rising" | "stable" | "cooling" | "dormant";
  first_seen: string;
  last_seen: string;
  occurrence_count: number;
  domain?: DomainBrief;
  related_tags: string[];
  latest_heat_score: number;
  topic_count: number;
}

export interface HeatCurvePoint {
  date: string;
  heat: number;
  signal_count: number;
  topic_count: number;
  milestone?: { title: string; type: string };
}

export interface TrendDetail extends TrendListItem {
  label_en?: string;
  description?: string;
  heat_curve: HeatCurvePoint[];
  related_topics: RelatedTopic[];
  recent_titles: string[];
}

// --- Search ---
export interface SearchResults {
  query: string;
  results: {
    topics: Array<{
      slug: string;
      title: string;
      score_total: number;
      batch_date: string;
      highlight: string;
      tags: string[];
    }>;
    signals: Array<{
      title: string;
      url?: string;
      source?: string;
      date?: string;
    }>;
  };
  total: { topics: number; signals: number };
}
