"""Pydantic schemas for Trends API responses."""
from pydantic import BaseModel
from typing import Optional
from datetime import date


class TrendDomainBrief(BaseModel):
    slug: str
    name: str
    color: str = "#4F6EF7"


class TrendListItem(BaseModel):
    key: str
    label: str
    status: str
    first_seen: date
    last_seen: date
    occurrence_count: int
    domain: Optional[TrendDomainBrief] = None
    related_tags: list[str] = []
    latest_heat_score: float = 0
    topic_count: int = 0


class TrendListResponse(BaseModel):
    items: list[TrendListItem]
    total: int
    page: int
    per_page: int
    total_pages: int


class HeatCurvePoint(BaseModel):
    date: date
    heat: float
    signal_count: int = 0
    topic_count: int = 0
    milestone: Optional[dict] = None  # {title, type}


class TrendRelatedTopic(BaseModel):
    slug: str
    title: str
    score_total: float
    batch_date: date


class TrendRelatedSignal(BaseModel):
    title: str
    url: Optional[str] = None
    source: Optional[str] = None
    date: Optional[date] = None


class TrendDetail(BaseModel):
    key: str
    label: str
    label_en: Optional[str] = None
    description: Optional[str] = None
    status: str
    first_seen: date
    last_seen: date
    occurrence_count: int
    domain: Optional[TrendDomainBrief] = None
    related_tags: list[str] = []
    heat_curve: list[HeatCurvePoint] = []
    related_topics: list[TrendRelatedTopic] = []
    recent_titles: list[str] = []
