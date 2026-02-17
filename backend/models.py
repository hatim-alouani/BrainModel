from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.sqlite import JSON as SQLITE_JSON
from sqlalchemy.types import Float
from sqlalchemy.sql import func
from .db import Base
import uuid


class Prediction(Base):
    __tablename__ = 'predictions'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    predicted_label = Column(String, nullable=False)
    probabilities_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
