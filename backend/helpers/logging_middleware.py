"""
Middleware for logging API requests and responses to database.
"""

from fastapi import Request
from database.database import SessionLocal, AppLog
import logging
import time

logger = logging.getLogger(__name__)

class DatabaseLoggingMiddleware:
    """Middleware that logs all API requests to the database."""

    async def __call__(self, request: Request, call_next):
        """
        Process the request and log it to the database.

        Args:
            request: The incoming FastAPI request
            call_next: The next middleware or route handler to call

        Returns:
            Response: The response from the next middleware or route handler
        """
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Only log non-static file requests
            if not request.url.path.endswith(('.html', '.js', '.css', '.png', '.jpg', '.gif')):
                with SessionLocal() as db:
                    log_entry = AppLog(
                        method=request.method,
                        path=request.url.path,
                        status_code=response.status_code,
                        response_summary=f"{response.status_code} - {response.headers.get('content-type', 'unknown') if hasattr(response, 'headers') else 'unknown'}"
                    )
                    db.add(log_entry)
                    db.commit()
                    
                logger.info(
                    f"{request.method} {request.url.path} - {response.status_code} - {time.time() - start_time:.3f}s"
                )
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            raise
