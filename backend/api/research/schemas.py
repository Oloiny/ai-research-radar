"""Pydantic schemas for Research API responses."""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class DomainBrief(BaseModel):
    slug: str
    name: str
    color: str = "#4F6EF7"


class ScoreBreakdown(BaseModel):
    timeliness: float = 0
    implementability: float = 0
    impact: float = 0
    material_richness: float = 0
    actionability: float = 0
    innovation: float = 0
    trend_bonus: float = 0


class ResearchListItem(BaseModel):
    id: str
    slug: str
    title: str
    core_insight: Optional[str] = None
    score_total: float
    score_breakdown: ScoreBreakdown
    tags: list[str] = []
    domain: Optional[DomainBrief] = None
    batch_date: date
    evidence_count: int = 0
    trend_count: int = 0
    published_at: Optional[datetime] = None


class PaginatedResponse(BaseModel):
    items: list[ResearchListItem]
    total: int
    page: int
    per_page: int
    total_pages: int


class EvidenceItem(BaseModel):
    id: str
    signal_title: str
    signal_url: Optional[str] = None
    signal_source: Optional[str] = None
    signal_date: Optional[date] = None
    quote: Optional[str] = None
    credibility: str = "标题推断"


class MiniHeatPoint(BaseModel):
    date: date
    heat: float


class LinkedTrend(BaseModel):
    key: str
    label: str
    status: str
    occurrence_count: int
    latest_heat_score: float = 0
    mini_heat_curve: list[MiniHeatPoint] = []


class RelatedTopic(BaseModel):
    slug: str
    title: str
    score_total: float
    batch_date: date


class ResearchDetail(BaseModel):
    id: str
    slug: str
    title: str
    body: str
    core_insight: Optional[str] = None
    score_total: float
    score_breakdown: ScoreBreakdown
    credibility_note: Optional[str] = None
    research_direction: Optional[str] = None
    tags: list[str] = []
    domain: Optional[DomainBrief] = None
    batch_date: date
    signal_window: Optional[str] = None
    published_at: Optional[datetime] = None
    evidence: list[EvidenceItem] = []
    linked_trends: list[LinkedTrend] = []
    related_topics: list[RelatedTopic] = []
