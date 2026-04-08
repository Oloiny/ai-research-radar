import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from database import Base


class RawSignal(Base):
    __tablename__ = "raw_signals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id = Column(String, ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text)
    url = Column(String, nullable=False)
    published_at = Column(DateTime(timezone=True))
    collected_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    is_processed = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint("source_id", "external_id", name="uq_signal_source_external"),
    )
