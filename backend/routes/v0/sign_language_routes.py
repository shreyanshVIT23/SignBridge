from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
import logging
from helpers.video_service import get_video_path, process_and_send_video
import os

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/videos",
    tags=["video_service"],
    responses={404: {"description": "Not found"}},
)

@router.get("/path/{word}", response_model=Dict[str, str])
async def get_video_path_endpoint(word: str) -> Dict[str, str]:
    """Get the video path for a specific word.
    
    Args:
        word: The word to search video for.
        
    Returns:
        Dictionary with the video path if found.
        
    Raises:
        HTTPException: 404 if video not found.
    """
    try:
        path = await get_video_path(word)
        return {"video_path": f"/videos/{os.path.basename(path)}"}
    except HTTPException as e:
        logger.error(f"Video not found for word: {word}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error getting video path: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/process-text/", response_model=Dict[str, Any])
async def process_text_endpoint(text: str = Query(..., description="Text to process into sign language videos", min_length=1)) -> Dict[str, Any]:
    """Process text into sign language videos.
    
    Args:
        text: The input text to process.
        
    Returns:
        Dictionary containing:
            - generated_text: The processed text from Gemini
            - video_paths: List of video paths for each word
            
    Raises:
        HTTPException: 422 if input validation fails
    """
    """Process text into sign language videos.
    
    Args:
        text: The input text to process.
        
    Returns:
        Dictionary containing:
            - generated_text: The processed text from Gemini
            - video_paths: List of video paths for each word
            
    Raises:
        HTTPException: 422 if input validation fails
        HTTPException: 500 if there's an error processing the request
    """
    if not text.strip():
        raise HTTPException(status_code=422, detail="Input text cannot be empty")
    
    try:
        result = await process_and_send_video(text)
        return result
    except Exception as e:
        logger.error(f"Error processing text: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing text")