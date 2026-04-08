import uuid
import json
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, Numeric
from database import Base


class JSONText(Text):
    """Store JSON as text for SQLite compatibility."""
    pass


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    triggered_by = Column(String, nullable=False, default="scheduler")
    status = Column(String, nullable=False, default="pending")
    signals_count = Column(Integer)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True))


class TopicCandidate(Base):
    __tablename__ = "topic_candidates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String, ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False)
    rank = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    strategic_relevance_score = Column(Numeric(3, 1), nullable=False)
    signal_strength_data = Column(Text, nullable=False, default="{}")  # stored as JSON string
    tags = Column(Text, nullable=False, default="[]")  # stored as JSON string
    is_novel = Column(Boolean, nullable=False, default=True)
    vote_count = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="candidate")
    strategic_rationale = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
