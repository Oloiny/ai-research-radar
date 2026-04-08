import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Date, DateTime, ForeignKey
from database import Base


class TopicEvidence(Base):
    __tablename__ = "topic_evidence"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(
        String, ForeignKey("research_topics.id", ondelete="CASCADE"), nullable=False
    )
    signal_id = Column(
        String, ForeignKey("raw_signals.id", ondelete="SET NULL")
    )

    signal_title = Column(String, nullable=False)
    signal_url = Column(String)
    signal_source = Column(String)
    signal_date = Column(Date)

    quote = Column(Text)
    credibility = Column(String, nullable=False, default="标题推断")
    relevance_note = Column(Text)
    sort_order = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
