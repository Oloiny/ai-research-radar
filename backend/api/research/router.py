"""Research API — public-facing endpoints for deep research topics."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from typing import Optional
from datetime import date

from database import get_db
from models.research_topic import ResearchTopic
from models.topic_evidence import TopicEvidence
from models.domain import Domain
from models.trend import Trend, TrendSnapshot, TopicTrend
from .schemas import (
    ResearchListItem, ResearchDetail, PaginatedResponse,
    ScoreBreakdown, DomainBrief, EvidenceItem,
    LinkedTrend, MiniHeatPoint, RelatedTopic,
)

router = APIRouter(prefix="/api/v1/research", tags=["research"])


def _build_score_breakdown(rt: ResearchTopic) -> ScoreBreakdown:
    return ScoreBreakdown(
        timeliness=float(rt.score_timeliness or 0),
        implementability=float(rt.score_implementability or 0),
        impact=float(rt.score_impact or 0),
        material_richness=float(rt.score_material_richness or 0),
        actionability=float(rt.score_actionability or 0),
        innovation=float(rt.score_innovation or 0),
        trend_bonus=float(rt.score_trend_bonus or 0),
    )


def _build_domain_brief(db: Session, domain_id: str) -> Optional[DomainBrief]:
    if not domain_id:
        return None
    d = db.query(Domain).filter(Domain.id == domain_id).first()
    if not d:
        return None
    return DomainBrief(slug=d.slug, name=d.name, color=d.color)


def _serialize_list_item(db: Session, rt: ResearchTopic) -> ResearchListItem:
    evidence_count = db.query(func.count(TopicEvidence.id)).filter(
        TopicEvidence.topic_id == rt.id
    ).scalar() or 0

    trend_count = db.query(func.count(TopicTrend.trend_id)).filter(
        TopicTrend.topic_id == rt.id
    ).scalar() or 0

    return ResearchListItem(
        id=rt.id,
        slug=rt.slug,
        title=rt.title,
        core_insight=rt.core_insight,
        score_total=float(rt.score_total),
        score_breakdown=_build_score_breakdown(rt),
        tags=rt.tags or [],
        domain=_build_domain_brief(db, rt.domain_id),
        batch_date=rt.batch_date,
        evidence_count=evidence_count,
        trend_count=trend_count,
        published_at=rt.published_at,
    )


@router.get("", response_model=PaginatedResponse)
def list_research(
    domain: Optional[str] = Query(None, description="Filter by domain slug"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    min_score: Optional[float] = Query(None, ge=6.0, le=9.5),
    sort: str = Query("newest", regex="^(newest|score|oldest)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(ResearchTopic).filter(ResearchTopic.status == "published")

    # Apply filters
    if domain:
        d = db.query(Domain).filter(Domain.slug == domain).first()
        if d:
            query = query.filter(ResearchTopic.domain_id == d.id)
    if tag:
        query = query.filter(ResearchTopic.tags.any(tag))
    if date_from:
        query = query.filter(ResearchTopic.batch_date >= date_from)
    if date_to:
        query = query.filter(ResearchTopic.batch_date <= date_to)
    if min_score is not None:
        query = query.filter(ResearchTopic.score_total >= min_score)

    # Count
    total = query.count()

    # Sort
    if sort == "score":
        query = query.order_by(desc(ResearchTopic.score_total))
    elif sort == "oldest":
        query = query.order_by(asc(ResearchTopic.batch_date))
    else:  # newest
        query = query.order_by(desc(ResearchTopic.batch_date), desc(ResearchTopic.score_total))

    # Paginate
    offset = (page - 1) * per_page
    topics = query.offset(offset).limit(per_page).all()

    items = [_serialize_list_item(db, rt) for rt in topics]
    total_pages = (total + per_page - 1) // per_page

    return PaginatedResponse(
        items=items, total=total, page=page,
        per_page=per_page, total_pages=total_pages,
    )


@router.get("/latest", response_model=PaginatedResponse)
def latest_research(db: Session = Depends(get_db)):
    """Return the most recent batch of research topics."""
    latest_date = db.query(func.max(ResearchTopic.batch_date)).filter(
        ResearchTopic.status == "published"
    ).scalar()

    if not latest_date:
        return PaginatedResponse(items=[], total=0, page=1, per_page=12, total_pages=0)

    topics = db.query(ResearchTopic).filter(
        ResearchTopic.status == "published",
        ResearchTopic.batch_date == latest_date,
    ).order_by(desc(ResearchTopic.score_total)).all()

    items = [_serialize_list_item(db, rt) for rt in topics]

    return PaginatedResponse(
        items=items, total=len(items), page=1,
        per_page=len(items), total_pages=1,
    )


@router.get("/{slug}", response_model=ResearchDetail)
def get_research_detail(slug: str, db: Session = Depends(get_db)):
    rt = db.query(ResearchTopic).filter(
        ResearchTopic.slug == slug,
        ResearchTopic.status == "published",
    ).first()

    if not rt:
        raise HTTPException(status_code=404, detail="Research topic not found")

    # Evidence chain
    evidence_rows = db.query(TopicEvidence).filter(
        TopicEvidence.topic_id == rt.id
    ).order_by(TopicEvidence.sort_order).all()

    evidence = [
        EvidenceItem(
            id=e.id,
            signal_title=e.signal_title,
            signal_url=e.signal_url,
            signal_source=e.signal_source,
            signal_date=e.signal_date,
            quote=e.quote,
            credibility=e.credibility,
        )
        for e in evidence_rows
    ]

    # Linked trends
    linked_trend_ids = [
        tt.trend_id for tt in
        db.query(TopicTrend).filter(TopicTrend.topic_id == rt.id).all()
    ]
    linked_trends = []
    for tid in linked_trend_ids:
        trend = db.query(Trend).filter(Trend.id == tid).first()
        if not trend:
            continue
        snapshots = db.query(TrendSnapshot).filter(
            TrendSnapshot.trend_id == tid
        ).order_by(TrendSnapshot.snapshot_date).all()
        mini_curve = [
            MiniHeatPoint(date=s.snapshot_date, heat=float(s.heat_score))
            for s in snapshots
        ]
        latest_heat = float(snapshots[-1].heat_score) if snapshots else 0
        linked_trends.append(LinkedTrend(
            key=trend.key,
            label=trend.label,
            status=trend.status,
            occurrence_count=trend.occurrence_count,
            latest_heat_score=latest_heat,
            mini_heat_curve=mini_curve,
        ))

    # Related topics (same batch, exclude self)
    related = db.query(ResearchTopic).filter(
        ResearchTopic.batch_date == rt.batch_date,
        ResearchTopic.id != rt.id,
        ResearchTopic.status == "published",
    ).order_by(desc(ResearchTopic.score_total)).limit(4).all()

    related_topics = [
        RelatedTopic(
            slug=r.slug, title=r.title,
            score_total=float(r.score_total), batch_date=r.batch_date,
        )
        for r in related
    ]

    return ResearchDetail(
        id=rt.id,
        slug=rt.slug,
        title=rt.title,
        body=rt.body,
        core_insight=rt.core_insight,
        score_total=float(rt.score_total),
        score_breakdown=_build_score_breakdown(rt),
        credibility_note=rt.credibility_note,
        research_direction=rt.research_direction,
        tags=rt.tags or [],
        domain=_build_domain_brief(db, rt.domain_id),
        batch_date=rt.batch_date,
        signal_window=rt.signal_window,
        published_at=rt.published_at,
        evidence=evidence,
        linked_trends=linked_trends,
        related_topics=related_topics,
    )
