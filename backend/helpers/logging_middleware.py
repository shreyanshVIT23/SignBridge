"""
Middleware for logging API requests and responses to PostgreSQL.
"""

import logging
import time

from database.database import Database
from database.models import AppLog
from fastapi import Request

logger = logging.getLogger(__name__)

class DatabaseLoggingMiddleware:
    """Middleware that logs all API requests to the PostgreSQL database."""

    async def __call__(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)

        # Skip static assets
        if not request.url.path.endswith(('.html', '.js', '.css', '.png', '.jpg', '.gif')):
            db = Database.get_session()
            try:
                log_entry = AppLog(
                    method=request.method,
                    path=request.url.path,
                    status_code=response.status_code,
                    response_summary=(
                        f"{response.status_code} - "
                        f"{response.headers.get('content-type', 'unknown')}"
                    ),
                )
                db.add(log_entry)
                db.commit()
            except Exception as err:
                db.rollback()
                logger.error(f"Failed to write AppLog: {err}")
            finally:
                db.close()

            logger.info(
                f"{request.method} {request.url.path} "
                f"- {response.status_code} - {time.time() - start_time:.3f}s"
            )

        return response
