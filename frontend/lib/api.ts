import type {
  ResearchListItem, ResearchDetail, PaginatedResponse,
  TrendListItem, TrendDetail,
  DomainListItem, DomainDetail,
  SearchResults,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 300 }, // ISR: 5 min cache
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---- Research ----

export interface ResearchParams {
  domain?: string;
  tag?: string;
  date_from?: string;
  date_to?: string;
  min_score?: number;
  sort?: "newest" | "score" | "oldest";
  page?: number;
  per_page?: number;
}

export function getResearchList(params: ResearchParams = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const qs = sp.toString();
  return fetchJSON<PaginatedResponse<ResearchListItem>>(
    `/api/v1/research${qs ? `?${qs}` : ""}`
  );
}

export function getLatestResearch() {
  return fetchJSON<PaginatedResponse<ResearchListItem>>("/api/v1/research/latest");
}

export function getResearchDetail(slug: string) {
  return fetchJSON<ResearchDetail>(`/api/v1/research/${slug}`);
}

// ---- Trends ----

export interface TrendParams {
  status?: string;
  domain?: string;
  sort?: "heat" | "newest" | "occurrence";
  page?: number;
  per_page?: number;
}

export function getTrends(params: TrendParams = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const qs = sp.toString();
  return fetchJSON<PaginatedResponse<TrendListItem>>(
    `/api/v1/trends${qs ? `?${qs}` : ""}`
  );
}

export function getTrendDetail(key: string) {
  return fetchJSON<TrendDetail>(`/api/v1/trends/${key}`);
}

// ---- Domains ----

export function getDomains() {
  return fetchJSON<{ items: DomainListItem[] }>("/api/v1/domains");
}

export function getDomainDetail(slug: string) {
  return fetchJSON<DomainDetail>(`/api/v1/domains/${slug}`);
}

// ---- Search ----

export function search(q: string, type: "all" | "topics" | "signals" = "all") {
  const sp = new URLSearchParams({ q, type });
  return fetchJSON<SearchResults>(`/api/v1/search?${sp.toString()}`);
}
