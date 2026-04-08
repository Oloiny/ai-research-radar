"""Trends API — trend tracking and heat curve endpoints."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional

from database import get_db
from models.trend import Trend, TrendSnapshot, TopicTrend
from models.domain import Domain
from models.research_topic import ResearchTopic
from .schemas import (
    TrendListItem, TrendListResponse, TrendDetail,
    TrendDomainBrief, HeatCurvePoint, TrendRelatedTopic,
)

router = APIRouter(prefix="/api/v1/trends", tags=["trends"])


def _get_domain_brief(db: Session, domain_id: str) -> Optional[TrendDomainBrief]:
    if not domain_id:
        return None
    d = db.query(Domain).filter(Domain.id == domain_id).first()
    if not d:
        return None
    return TrendDomainBrief(slug=d.slug, name=d.name, color=d.color)


def _get_latest_heat(db: Session, trend_id: str) -> float:
    snap = db.query(TrendSnapshot).filter(
        TrendSnapshot.trend_id == trend_id
    ).order_by(desc(TrendSnapshot.snapshot_date)).first()
    return float(snap.heat_score) if snap else 0


@router.get("", response_model=TrendListResponse)
def list_trends(
    status: Optional[str] = Query(None, regex="^(emerging|rising|stable|cooling|dormant)$"),
    domain: Optional[str] = Query(None),
    sort: str = Query("heat", regex="^(heat|newest|occurrence)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Trend)

    if status:
        query = query.filter(Trend.status == status)
    if domain:
        d = db.query(Domain).filter(Domain.slug == domain).first()
        if d:
            query = query.filter(Trend.domain_id == d.id)

    total = query.count()

    # Sort
    if sort == "newest":
        query = query.order_by(desc(Trend.last_seen))
    elif sort == "occurrence":
        query = query.order_by(desc(Trend.occurrence_count))
    else:  # heat — sort by occurrence * recency heuristic
        query = query.order_by(desc(Trend.occurrence_count), desc(Trend.last_seen))

    offset = (page - 1) * per_page
    trends = query.offset(offset).limit(per_page).all()

    items = []
    for t in trends:
        topic_count = db.query(func.count(TopicTrend.topic_id)).filter(
            TopicTrend.trend_id == t.id
        ).scalar() or 0

        items.append(TrendListItem(
            key=t.key,
            label=t.label,
            status=t.status,
            first_seen=t.first_seen,
            last_seen=t.last_seen,
            occurrence_count=t.occurrence_count,
            domain=_get_domain_brief(db, t.domain_id),
            related_tags=t.related_tags or [],
            latest_heat_score=_get_latest_heat(db, t.id),
            topic_count=topic_count,
        ))

    total_pages = (total + per_page - 1) // per_page
    return TrendListResponse(
        items=items, total=total, page=page,
        per_page=per_page, total_pages=total_pages,
    )


@router.get("/{key}", response_model=TrendDetail)
def get_trend_detail(key: str, db: Session = Depends(get_db)):
    trend = db.query(Trend).filter(Trend.key == key).first()
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")

    # Heat curve
    snapshots = db.query(TrendSnapshot).filter(
        TrendSnapshot.trend_id == trend.id
    ).order_by(TrendSnapshot.snapshot_date).all()

    heat_curve = []
    for s in snapshots:
        milestone = None
        if s.milestone_title:
            milestone = {"title": s.milestone_title, "type": s.milestone_type}
        heat_curve.append(HeatCurvePoint(
            date=s.snapshot_date,
            heat=float(s.heat_score),
            signal_count=s.signal_count,
            topic_count=s.topic_count,
            milestone=milestone,
        ))

    # Related topics
    topic_ids = [
        tt.topic_id for tt in
        db.query(TopicTrend).filter(TopicTrend.trend_id == trend.id).all()
    ]
    related_topics = []
    if topic_ids:
        topics = db.query(ResearchTopic).filter(
            ResearchTopic.id.in_(topic_ids),
            ResearchTopic.status == "published",
        ).order_by(desc(ResearchTopic.batch_date)).limit(10).all()
        related_topics = [
            TrendRelatedTopic(
                slug=t.slug, title=t.title,
                score_total=float(t.score_total), batch_date=t.batch_date,
            )
            for t in topics
        ]

    return TrendDetail(
        key=trend.key,
        label=trend.label,
        label_en=trend.label_en,
        description=trend.description,
        status=trend.status,
        first_seen=trend.first_seen,
        last_seen=trend.last_seen,
        occurrence_count=trend.occurrence_count,
        domain=_get_domain_brief(db, trend.domain_id),
        related_tags=trend.related_tags or [],
        heat_curve=heat_curve,
        related_topics=related_topics,
        recent_titles=trend.recent_titles or [],
    )
