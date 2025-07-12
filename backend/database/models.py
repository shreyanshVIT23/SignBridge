"""
AppLog model to capture request/response logs.
"""

from datetime import datetime

from database.database import Database
from sqlalchemy import Column, DateTime, Integer, String, Text

Base = Database.Base

class AppLog(Base):
    __tablename__ = "app_logs"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String(10), nullable=False)
    path = Column(String(255), nullable=False)
    status_code = Column(Integer, nullable=False)
    response_summary = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
