import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime
from database import Base


class Domain(Base):
    __tablename__ = "domains"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    name_en = Column(String)
    description = Column(Text)
    color = Column(String, nullable=False, default="#4F6EF7")
    icon = Column(String)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
