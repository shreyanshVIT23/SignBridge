"""Main FastAPI application module.

This module defines the FastAPI app instance, middleware, and route handlers for the speech to sign language converter backend.

Routes:
- /api/hello: Returns a simple hello message.
- /api/video/{word}: Streams the video file corresponding to the given word.
- /api/convert-text: Converts text to multiple sign language videos.
- /api/convert-sentence: Converts a sentence to concatenated sign language videos.
- /api/available-words: Lists all available sign language words.
"""

import logging
import os
import time

from database.database import Database
from database.models import AppLog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from helpers.logging_middleware import DatabaseLoggingMiddleware
from helpers.middleware import sanitize_input
from routes.v0.authentication_routes import router as auth_router
from routes.v0.sign_language_routes import router as sign_language_router
from utils.config import settings

logging.basicConfig(level=logging.DEBUG)
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Add this to expose headers
)

# Add middleware
app.middleware("http")(DatabaseLoggingMiddleware())
app.include_router(sign_language_router)
app.include_router(auth_router)

# Create tables
Database.Base.metadata.create_all(bind=Database.get_engine())

# Mount static files
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Mount videos directory
app.mount("/videos", StaticFiles(directory=str(settings.video_dir), html=True), name="videos")


async def log_request_response(
    request: Request, response_status: int, response_content: str
):
    db = Database.get_session()
    try:
        log_entry = AppLog(
            method=request.method,
            path=str(request.url),
            status_code=response_status,
            response_summary=response_content[:500],  # Limit summary length
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        logging.error(f"Failed to log request/response: {e}")
        db.rollback()
    finally:
        db.close()


app.middleware("http")(sanitize_input)

if os.getenv("APP_ENV") != "test":
    app.middleware("http")(DatabaseLoggingMiddleware())
    app.middleware("http")(sanitize_input)

    @app.middleware("http")
    async def logging_middleware(request: Request, call_next):
        start_time = time.time()

        # Get response
        response = await call_next(request)
        process_time = time.time() - start_time

        # Extract response content safely
        content = ""
        try:
            # For JSON responses, we can get a summary
            if hasattr(response, "body"):
                # This approach works better for FastAPI responses
                if response.status_code < 400:
                    content = f"Success response - Status: {response.status_code}"
                else:
                    content = f"Error response - Status: {response.status_code}"
            else:
                content = f"Response - Status: {response.status_code}"
        except Exception:
            content = f"<could not read response> - Status: {response.status_code}"

        # Log to database
        await log_request_response(request, response.status_code, content)

        # Log to console
        logging.info(
            f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s"
        )

        return response


if __name__ == "__main__":
    import uvicorn
    from utils.config import settings

    uvicorn.run(app, host=settings.host, port=settings.port)
