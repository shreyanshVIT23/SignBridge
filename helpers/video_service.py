"""Module providing video service utilities.

This module contains functions to get video file paths based on words and to process video-related
operations including generating sign language text and retrieving video paths.

Functions:
- get_video_path: Asynchronously gets the file path of a video corresponding to a given word.
- process_and_send_video: Asynchronously generates sign language text and retrieves video paths for each word in the GeminiClient response.
"""

import asyncio
import re
import logging
from typing import List, Dict, Any
from fastapi import HTTPException
from pathlib import Path
from utils.config import settings
from utils.gemini_client import GeminiClient

logger = logging.getLogger(__name__)


async def get_video_path(word: str) -> str:
    """Get the relative file path of a video corresponding to a given word.

    Args:
        word (str): The word to search video for.

    Returns:
        str: The relative file path to the video (e.g., 'videos/hello.mp4').

    Raises:
        HTTPException: If the video file does not exist.

    Example:
        >>> video_path = await get_video_path('hello')
        >>> print(video_path)
        'videos/hello.mp4'
    """
    safe_word = re.sub(r"[^a-zA-Z0-9_-]", "", word)

    # Use the full system path to check if file exists
    video_path = Path(settings.video_dir) / f"{safe_word}.mp4"
    print(f"DEBUG: Looking for video file at: {video_path.resolve()}")

    if video_path.exists():
        print(f"DEBUG: Found video file at: {video_path.resolve()}")

        # Return relative path in the format expected by tests and frontend
        # Convert to forward slashes and use relative path format
        relative_path = f"videos/{safe_word.lower()}.mp4"
        return relative_path
    else:
        print(f"DEBUG: Video file not found: {video_path.resolve()}")
        raise HTTPException(status_code=404, detail="Video not found")


async def process_and_send_video(text: str) -> Dict[str, Any]:
    """Generate sign language text and get video paths for each word in the GeminiClient response.

    Args:
        text (str): The input text (word or sentence) to generate sign language text for.

    Returns:
        Dict[str, Any]: Dictionary containing the generated text and a list of video file paths.

    Example:
        >>> result = await process_and_send_video('hello world')
        >>> print(result)
        {'generated_text': '...', 'video_paths': ['videos/hello.mp4', 'videos/world.mp4']}
    """
    # Generate text using GeminiClient
    client = GeminiClient()
    generated_text = await client.generate_text(prompt=text)

    # Extract words from generated text
    words = re.findall(r"\b\w+\b", generated_text)

    video_paths: List[str] = []
    for w in words:
        try:
            path = await get_video_path(w)
            video_paths.append(path)
        except HTTPException:
            logger.warning(f"Video not found for word: {w}")
            continue

    return {"generated_text": generated_text, "video_paths": video_paths}


# Local offline test function


def test_get_video_path():
    test_words = ["0", "hello", "test"]
    for word in test_words:
        try:
            path = asyncio.run(get_video_path(word))
            print(f"Test word: {word}, Video path: {path}")
        except HTTPException as e:
            print(f"Test word: {word}, Error: {e.detail}")


def test_process_and_send_video():
    import asyncio

    async def run_test():
        # Test with a single word
        # result_word = await process_and_send_video('hello')
        # assert 'generated_text' in result_word
        # assert 'video_paths' in result_word
        # assert isinstance(result_word['video_paths'], list)

        # Test with a sentence
        result_sentence = await process_and_send_video("I am happy.")
        assert "generated_text" in result_sentence
        assert "video_paths" in result_sentence
        assert isinstance(result_sentence["video_paths"], list)

    asyncio.run(run_test())


if __name__ == "__main__":
    # test_get_video_path()
    test_process_and_send_video()
