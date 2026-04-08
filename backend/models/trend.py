import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Date, DateTime,
    ForeignKey, Numeric,
)
from sqlalchemy.dialects.postgresql import ARRAY
from database import Base


class Trend(Base):
    __tablename__ = "trends"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String, nullable=False, unique=True)
    label = Column(String, nullable=False)
    label_en = Column(String)
    description = Column(Text)

    status = Column(String, nullable=False, default="emerging")

    first_seen = Column(Date, nullable=False)
    last_seen = Column(Date, nullable=False)
    occurrence_count = Column(Integer, nullable=False, default=1)

    related_tags = Column(ARRAY(String), nullable=False, default=list)
    recent_titles = Column(ARRAY(String), nullable=False, default=list)

    domain_id = Column(String, ForeignKey("domains.id", ondelete="SET NULL"))

    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class TrendSnapshot(Base):
    __tablename__ = "trend_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trend_id = Column(
        String, ForeignKey("trends.id", ondelete="CASCADE"), nullable=False
    )
    snapshot_date = Column(Date, nullable=False)

    signal_count = Column(Integer, nullable=False, default=0)
    topic_count = Column(Integer, nullable=False, default=0)
    heat_score = Column(Numeric(4, 1), nullable=False, default=0)

    milestone_title = Column(Text)
    milestone_type = Column(String)

    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class TopicTrend(Base):
    """Many-to-many: research_topics ↔ trends"""
    __tablename__ = "topic_trends"

    topic_id = Column(
        String, ForeignKey("research_topics.id", ondelete="CASCADE"),
        primary_key=True,
    )
    trend_id = Column(
        String, ForeignKey("trends.id", ondelete="CASCADE"),
        primary_key=True,
    )
