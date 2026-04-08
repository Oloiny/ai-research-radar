"""Pydantic schemas for Domains API."""
from pydantic import BaseModel
from typing import Optional
from datetime import date


class DomainListItem(BaseModel):
    slug: str
    name: str
    name_en: Optional[str] = None
    color: str = "#4F6EF7"
    icon: Optional[str] = None
    signal_count: int = 0
    topic_count: int = 0
    active_trend_count: int = 0
    avg_score: float = 0
    latest_topic_date: Optional[date] = None
    momentum: str = "stable"  # rising / stable / cooling


class DomainListResponse(BaseModel):
    items: list[DomainListItem]


class DomainDetail(BaseModel):
    slug: str
    name: str
    name_en: Optional[str] = None
    description: Optional[str] = None
    color: str = "#4F6EF7"
    icon: Optional[str] = None
    stats: dict  # signal_count, topic_count, active_trend_count, avg_score
