"""
Sign Language API Routes
======================

This module contains FastAPI routes for converting text to sign language and managing sign language video assets.

Features:
- Convert text to sign language using GeminiClient
- Retrieve video paths for individual words
- Batch processing of multiple words
- Health check endpoint

Endpoints:
- POST /process-text: Convert text to sign language and get video paths
- GET /video/{word}: Get video path for a specific word
- POST /process-words: Process multiple words in batch
- GET /health: Health check endpoint

Dependencies:
- FastAPI for routing and API framework
- Pydantic for request/response validation
- Custom video service for processing and retrieving video assets

Error Handling:
- Comprehensive error handling with proper logging
- HTTP status codes for different error scenarios
- Detailed error messages for debugging

Security:
- Input validation using Pydantic models
- Rate limiting and security features inherited from FastAPI

Logging:
- Uses Python's logging module for tracking API operations
- Error logging for debugging and monitoring

Usage:
```python
# Example usage
from fastapi import FastAPI
app = FastAPI()

# Include the sign language router
app.include_router(sign_language_routes.router)
```
"""

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, Field
from typing import Dict, Any
import logging
from helpers.video_service import process_and_send_video, get_video_path

logger = logging.getLogger(__name__)

# Create router with versioned prefix and tags
router = APIRouter(
    prefix="/api/v2/sign-language",
    tags=["Sign Language"],
)

# Pydantic models for request/response
class TextProcessRequest(BaseModel):
    """Request model for text processing."""
    text: str = Field(
        ..., 
        min_length=1, 
        max_length=1000, 
        description="Text to convert to sign language",
        alias="text"
    )

class VideoPathResponse(BaseModel):
    """Response model for single video path lookup."""
    word: str = Field(..., description="The word that was searched")
    video_path: str = Field(..., description="Path to the video file")

class SignLanguageResponse(BaseModel):
    """Response model for sign language processing."""
    original_text: str = Field(..., description="The original input text")
    generated_text: str = Field(..., description="Generated sign language text")
    video_paths: list[str] = Field(..., description="List of video file paths")
    total_videos: int = Field(..., description="Total number of video files found")

@router.post("/process-text", response_model=SignLanguageResponse)
async def process_text_to_sign_language(request: TextProcessRequest) -> SignLanguageResponse:
    """
    Process text and return sign language video paths.
    
    This endpoint takes input text, generates sign language text using GeminiClient,
    and returns paths to corresponding video files for each word.
    
    Args:
        request: TextProcessRequest containing the text to process
        
    Returns:
        SignLanguageResponse: Contains generated text and video paths
        
    Raises:
        HTTPException: If processing fails
    """
    try:
        logger.info(f"Processing text: {request.text}")
        
        # Process the text using the helper function
        result = await process_and_send_video(request.text)
        
        return SignLanguageResponse(
            original_text=request.text,
            generated_text=result["generated_text"],
            video_paths=result["video_paths"],
            total_videos=len(result["video_paths"])
        )
        
    except Exception as e:
        logger.error(f"Error processing text: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process text: {str(e)}"
        )

@router.get("/video/{word}", response_model=VideoPathResponse)
async def get_video_for_word(
    word: str = Path(..., description="Word to get video for")
) -> VideoPathResponse:
    """
    Get video path for a specific word.
    
    Args:
        word: The word to search video for
        
    Returns:
        VideoPathResponse: Contains the word and its video path
        
    Raises:
        HTTPException: If video not found (404) or other errors (500)
    """
    try:
        logger.info(f"Getting video path for word: {word}")
        
        video_path = await get_video_path(word)
        
        return VideoPathResponse(
            word=word,
            video_path=video_path
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 404 for video not found)
        raise
    except Exception as e:
        logger.error(f"Error getting video path for word '{word}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get video path: {str(e)}"
        )

@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    
    Returns:
        Dict indicating service status
    """
    return {"status": "healthy", "service": "sign-language-api"}

# Optional: Batch processing endpoint
@router.post("/process-words", response_model=Dict[str, Any])
async def process_multiple_words(
    words: list[str] = Path(..., description="List of words to process")
) -> Dict[str, Any]:
    """
    Process multiple words and return their video paths.
    
    Args:
        words: List of words to get videos for
        
    Returns:
        Dict containing results for each word
    """
    try:
        results = {}
        found_videos = []
        missing_videos = []
        
        for word in words:
            try:
                video_path = await get_video_path(word)
                results[word] = {
                    "status": "found",
                    "video_path": video_path
                }
                found_videos.append(word)
            except HTTPException:
                results[word] = {
                    "status": "not_found",
                    "video_path": None
                }
                missing_videos.append(word)
        
        return {
            "results": results,
            "summary": {
                "total_words": len(words),
                "found": len(found_videos),
                "missing": len(missing_videos),
                "found_words": found_videos,
                "missing_words": missing_videos
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing multiple words: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process words: {str(e)}"
        )
