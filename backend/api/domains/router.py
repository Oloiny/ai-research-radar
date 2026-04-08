"""Domains API — domain atlas and domain detail endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, timedelta

from database import get_db
from models.domain import Domain
from models.research_topic import ResearchTopic
from models.trend import Trend
from .schemas import DomainListItem, DomainListResponse, DomainDetail

router = APIRouter(prefix="/api/v1/domains", tags=["domains"])


def _compute_domain_stats(db: Session, domain_id: str) -> dict:
    """Compute aggregated stats for a domain."""
    topic_count = db.query(func.count(ResearchTopic.id)).filter(
        ResearchTopic.domain_id == domain_id,
        ResearchTopic.status == "published",
    ).scalar() or 0

    avg_score = db.query(func.avg(ResearchTopic.score_total)).filter(
        ResearchTopic.domain_id == domain_id,
        ResearchTopic.status == "published",
    ).scalar()
    avg_score = round(float(avg_score), 1) if avg_score else 0

    active_trend_count = db.query(func.count(Trend.id)).filter(
        Trend.domain_id == domain_id,
        Trend.status.in_(["emerging", "rising", "stable"]),
    ).scalar() or 0

    latest_topic_date = db.query(func.max(ResearchTopic.batch_date)).filter(
        ResearchTopic.domain_id == domain_id,
        ResearchTopic.status == "published",
    ).scalar()

    return {
        "topic_count": topic_count,
        "active_trend_count": active_trend_count,
        "avg_score": avg_score,
        "latest_topic_date": latest_topic_date,
    }


def _compute_momentum(db: Session, domain_id: str) -> str:
    """Simple momentum: compare recent batch count to overall average."""
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_count = db.query(func.count(ResearchTopic.id)).filter(
        ResearchTopic.domain_id == domain_id,
        ResearchTopic.status == "published",
        ResearchTopic.batch_date >= thirty_days_ago,
    ).scalar() or 0

    total_count = db.query(func.count(ResearchTopic.id)).filter(
        ResearchTopic.domain_id == domain_id,
        ResearchTopic.status == "published",
    ).scalar() or 0

    if total_count == 0:
        return "stable"

    # Heuristic: if recent topics > average monthly rate, rising
    if recent_count >= 3:
        return "rising"
    elif recent_count >= 1:
        return "stable"
    else:
        return "cooling"


@router.get("", response_model=DomainListResponse)
def list_domains(db: Session = Depends(get_db)):
    domains = db.query(Domain).order_by(Domain.sort_order).all()

    items = []
    for d in domains:
        stats = _compute_domain_stats(db, d.id)
        momentum = _compute_momentum(db, d.id)

        items.append(DomainListItem(
            slug=d.slug,
            name=d.name,
            name_en=d.name_en,
            color=d.color,
            icon=d.icon,
            signal_count=0,  # TODO: count signals linked via topic_evidence
            topic_count=stats["topic_count"],
            active_trend_count=stats["active_trend_count"],
            avg_score=stats["avg_score"],
            latest_topic_date=stats["latest_topic_date"],
            momentum=momentum,
        ))

    return DomainListResponse(items=items)


@router.get("/{slug}", response_model=DomainDetail)
def get_domain_detail(slug: str, db: Session = Depends(get_db)):
    domain = db.query(Domain).filter(Domain.slug == slug).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    stats = _compute_domain_stats(db, domain.id)

    return DomainDetail(
        slug=domain.slug,
        name=domain.name,
        name_en=domain.name_en,
        description=domain.description,
        color=domain.color,
        icon=domain.icon,
        stats={
            "topic_count": stats["topic_count"],
            "active_trend_count": stats["active_trend_count"],
            "avg_score": stats["avg_score"],
        },
    )
