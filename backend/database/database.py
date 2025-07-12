"""
Database configuration and session management using PostgreSQL.

Implements a singleton-style Database class to manage engine, session, and Base across the app.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from utils.config import settings


class Database:
    """Singleton accessor for SQLAlchemy engine and session factory."""
    _engine = None
    _SessionLocal = None
    Base = declarative_base()

    @classmethod
    def init(cls):
        if cls._engine is None:
            cls._engine = create_engine(settings.database_url, future=True)
            cls._SessionLocal = sessionmaker(
                bind=cls._engine,
                autoflush=False,
                autocommit=False,
                future=True
            )

    @classmethod
    def get_engine(cls):
        cls.init()
        return cls._engine

    @classmethod
    def get_session(cls) -> Session:
        cls.init()
        return cls._SessionLocal()

def get_db():
    """FastAPI dependency to yield a DB session and ensure it’s closed."""
    db = Database.get_session()
    try:
        yield db
    finally:
        db.close()
