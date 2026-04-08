import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Text
from database import Base


class PublishedTopic(Base):
    __tablename__ = "published_topics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    tags = Column(Text, nullable=False, default="[]")  # stored as JSON string
    published_week = Column(Date, nullable=False)
    report_url = Column(String)
    source_topic_id = Column(String, ForeignKey("topic_candidates.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
