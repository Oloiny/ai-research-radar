import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Date, DateTime,
    ForeignKey, Numeric, Index,
)
from sqlalchemy.dialects.postgresql import ARRAY, TSVECTOR
from database import Base


class ResearchTopic(Base):
    __tablename__ = "research_topics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)

    # 6 维评分
    score_total = Column(Numeric(3, 1), nullable=False)
    score_timeliness = Column(Numeric(2, 1), nullable=False, default=0)
    score_implementability = Column(Numeric(2, 1), nullable=False, default=0)
    score_impact = Column(Numeric(2, 1), nullable=False, default=0)
    score_material_richness = Column(Numeric(2, 1), nullable=False, default=0)
    score_actionability = Column(Numeric(2, 1), nullable=False, default=0)
    score_innovation = Column(Numeric(2, 1), nullable=False, default=0)
    score_trend_bonus = Column(Numeric(2, 1), nullable=False, default=0)

    credibility_note = Column(Text)
    research_direction = Column(Text)
    core_insight = Column(Text)
    signal_window = Column(String)
    tags = Column(ARRAY(String), nullable=False, default=list)

    # 关联
    domain_id = Column(String, ForeignKey("domains.id", ondelete="SET NULL"))
    batch_date = Column(Date, nullable=False)
    rank_in_batch = Column(Integer)

    # 全文搜索（由数据库触发器维护，Python 侧只读）
    search_vector = Column(TSVECTOR)

    # 回溯内部管线
    source_topic_candidate_id = Column(
        String, ForeignKey("topic_candidates.id", ondelete="SET NULL")
    )

    status = Column(String, nullable=False, default="published")
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
