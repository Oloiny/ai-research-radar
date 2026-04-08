"""Search API — full-text search across research topics and signals."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func, desc
from typing import Optional

from database import get_db
from models.research_topic import ResearchTopic
from models.signal import RawSignal

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("")
def search(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    type: str = Query("all", regex="^(all|topics|signals)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    results = {"topics": [], "signals": []}
    totals = {"topics": 0, "signals": 0}
    offset = (page - 1) * per_page

    # Search topics using tsvector
    if type in ("all", "topics"):
        # Use plainto_tsquery with 'simple' config for Chinese compatibility
        ts_query = func.plainto_tsquery("simple", q)

        topic_query = db.query(ResearchTopic).filter(
            ResearchTopic.status == "published",
            ResearchTopic.search_vector.op("@@")(ts_query),
        ).order_by(desc(ResearchTopic.score_total))

        totals["topics"] = topic_query.count()
        topics = topic_query.offset(offset).limit(per_page).all()

        for rt in topics:
            # Generate a simple highlight from body
            highlight = rt.body[:200] + "..." if rt.body and len(rt.body) > 200 else rt.body

            results["topics"].append({
                "slug": rt.slug,
                "title": rt.title,
                "score_total": float(rt.score_total),
                "batch_date": rt.batch_date.isoformat() if rt.batch_date else None,
                "highlight": highlight,
                "tags": rt.tags or [],
            })

    # Search signals by title (simple ILIKE for now)
    if type in ("all", "signals"):
        like_pattern = f"%{q}%"
        signal_query = db.query(RawSignal).filter(
            RawSignal.title.ilike(like_pattern),
        ).order_by(desc(RawSignal.published_at))

        totals["signals"] = signal_query.count()
        signals = signal_query.offset(offset).limit(per_page).all()

        for sig in signals:
            results["signals"].append({
                "title": sig.title,
                "url": sig.url,
                "source": None,  # Would need join to get source name
                "date": sig.published_at.date().isoformat() if sig.published_at else None,
            })

    return {
        "query": q,
        "results": results,
        "total": totals,
        "page": page,
        "per_page": per_page,
    }
