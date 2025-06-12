from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from typing import Dict, List, Optional
from pydantic import BaseModel
import asyncio
import tempfile
import os
import sys
from pathlib import Path
from helpers.video_service import get_video_path
from utils.config import settings
import logging
from app import app

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))
video_dir = Path(settings.video_dir)
video_dir.mkdir(exist_ok=True)
print(f"Video directory: {video_dir}")

router = APIRouter(prefix="/api/v0/sign-language", tags=["Sign Language"])

class TextConversionRequest(BaseModel):
    text: str
    words: Optional[List[str]] = None  # Optional: pre-split words


class SentenceConversionRequest(BaseModel):
    sentence: str
    concatenate: Optional[bool] = True  # Whether to fuse videos into one file


@app.get("/api/hello")
async def hello() -> Dict[str, str]:
    """Simple hello endpoint returning a welcome message.

    Returns:
        Dict[str, str]: A dictionary containing a welcome message.

    Example:
        >>> response = await hello()
        >>> print(response)
        {'message': 'Hello from FastAPI!'}
    """
    return {"message": "Hello from FastAPI - Text to Sign Language Converter!"}


@app.get("/api/video/{word}")
async def get_video(word: str):
    """Endpoint to fetch a video file for a given word.

    Args:
        word (str): The word to fetch the video for.

    Returns:
        FileResponse: The video file response with media type 'video/mp4'.

    Example:
        >>> response = await get_video('hello')
        >>> # response will be a FileResponse streaming the video file
    """
    video_path = await get_video_path(word)
    return FileResponse(video_path, media_type="video/mp4")


@app.post("/api/convert-text")
async def convert_text_to_sign_videos(request: TextConversionRequest):
    """Convert text to multiple sign language videos (one per word).

    Args:
        request: TextConversionRequest containing text to convert

    Returns:
        JSONResponse: List of video paths for each word

    Raises:
        HTTPException: If words not found in sign language database
    """

    try:
        print(request.words)
        print(request.text)
        # Split text into words if not provided
        if not request.text:
            if request.words:
                words = " ".join(request.words)
            else:
                raise HTTPException(status_code=400, detail="Input not provided")
        else:
            words = request.text

        video_files = []
        missing_words = []

        # Get video path for each word
        for word in words:
            try:
                video_path = await get_video_path(word)
                video_files.append(
                    {
                        "word": word,
                        "video_path": str(video_path),
                        "exists": True,
                        "file_size": (
                            os.path.getsize(video_path)
                            if os.path.exists(video_path)
                            else 0
                        ),
                    }
                )
                logging.info(f"Found video for word: {word}")
            except Exception as e:
                missing_words.append(word)
                video_files.append(
                    {"word": word, "video_path": None, "exists": False, "error": str(e)}
                )
                logging.warning(f"No video found for word: {word}")

        return JSONResponse(
            {
                "message": f"Processed {len(words)} words",
                "original_text": request.text,
                "words": words,
                "videos": video_files,
                "missing_words": missing_words,
                "success_count": len([v for v in video_files if v["exists"]]),
                "missing_count": len(missing_words),
            }
        )

    except Exception as e:
        logging.error(f"Text conversion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text conversion failed: {str(e)}")


@app.post("/api/convert-sentence")
async def convert_sentence_to_sign_video(request: SentenceConversionRequest):
    """Convert a sentence to sign language video(s).

    Args:
        request: SentenceConversionRequest with sentence and concatenation option

    Returns:
        FileResponse or JSONResponse: Single concatenated video or list of videos

    Raises:
        HTTPException: If conversion fails or videos not found
    """

    try:
        # Clean and split sentence into words
        words = request.sentence.lower().strip().split()
        words = [word.strip('.,!?;:"()[]{}') for word in words if word.strip()]

        if not words:
            raise HTTPException(
                status_code=400, detail="No valid words found in sentence"
            )

        video_paths = []
        missing_words = []

        # Collect video paths for each word
        for word in words:
            try:
                video_path = await get_video_path(word)
                if os.path.exists(video_path):
                    video_paths.append(str(video_path))
                    logging.info(f"Found video for word: {word}")
                else:
                    missing_words.append(word)
                    logging.warning(f"Video file not found: {video_path}")
            except Exception as e:
                missing_words.append(word)
                logging.warning(f"No video found for word: {word} - {str(e)}")

        if not video_paths:
            raise HTTPException(
                status_code=404,
                detail=f"No videos found for any words in sentence. Missing: {missing_words}",
            )

        if missing_words:
            logging.warning(f"Some words missing videos: {missing_words}")

        # Return individual videos or concatenated video
        if not request.concatenate:
            return JSONResponse(
                {
                    "message": f"Found {len(video_paths)} videos for sentence",
                    "sentence": request.sentence,
                    "words": words,
                    "video_paths": video_paths,
                    "missing_words": missing_words,
                }
            )

        # Concatenate videos into single file
        if len(video_paths) == 1:
            # Single video - just return it
            return FileResponse(
                video_paths[0],
                media_type="video/mp4",
                filename=f"sign_language_{words[0]}.mp4",
            )

        # Multiple videos - concatenate them
        output_path = await concatenate_videos(video_paths, words)

        return FileResponse(
            output_path, media_type="video/mp4", filename="sign_language_sentence.mp4"
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Sentence conversion failed: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Sentence conversion failed: {str(e)}"
        )


async def concatenate_videos(video_paths: List[str], words: List[str]) -> str:
    """Concatenate multiple video files into a single video using FFmpeg.

    Args:
        video_paths: List of video file paths to concatenate
        words: List of words for filename generation

    Returns:
        str: Path to the concatenated video file

    Raises:
        Exception: If FFmpeg concatenation fails
    """

    # Create temporary output file
    temp_dir = tempfile.gettempdir()
    # Use first 3 words
    output_filename = f"sign_language_{'_'.join(words[:3])}.mp4"
    output_path = os.path.join(temp_dir, output_filename)

    try:
        # Create temporary file list for FFmpeg
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            for video_path in video_paths:
                # Escape file paths for FFmpeg
                escaped_path = video_path.replace("'", "'\"'\"'")
                f.write(f"file '{escaped_path}'\n")
            temp_list_file = f.name

        # FFmpeg command for concatenation
        cmd = [
            "ffmpeg",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            temp_list_file,
            "-c",
            "copy",  # Copy streams without re-encoding (fastest)
            "-y",  # Overwrite output file
            output_path,
        ]

        # Execute FFmpeg asynchronously
        process = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        # Cleanup temp file list
        os.unlink(temp_list_file)

        if process.returncode != 0:
            raise Exception(f"FFmpeg failed: {stderr.decode()}")

        logging.info(
            f"Successfully concatenated {len(video_paths)} videos into {output_path}"
        )
        return output_path

    except Exception as e:
        # Cleanup on error
        if "temp_list_file" in locals() and os.path.exists(temp_list_file):
            os.unlink(temp_list_file)
        if os.path.exists(output_path):
            os.unlink(output_path)

        logging.error(f"Video concatenation failed: {str(e)}")
        raise Exception(f"Video concatenation failed: {str(e)}")


@app.get("/api/available-words")
async def get_available_sign_words():
    """Get list of all available sign language words.

    Returns:
        JSONResponse: List of available words with video files
    """

    try:
        available_words = []

        # Scan video directory for available sign language videos
        for video_file in video_dir.glob("*.mp4"):
            if video_file.is_file():
                word = video_file.stem  # filename without extension
                file_size = os.path.getsize(video_file)

                available_words.append(
                    {
                        "word": word,
                        "filename": video_file.name,
                        "path": str(video_file),
                        "size": file_size,
                    }
                )

        # Sort alphabetically
        available_words.sort(key=lambda x: x["word"])

        return JSONResponse(
            {
                "message": f"Found {len(available_words)} available sign language words",
                "word_count": len(available_words),
                "words": [word["word"] for word in available_words],
                "video_details": available_words,
                "video_directory": str(video_dir),
            }
        )

    except Exception as e:
        logging.error(f"Failed to get available words: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get available words: {str(e)}"
        )


@app.get("/api/videos/multiple/{words}")
async def get_multiple_videos(words: str):
    """Get multiple video files for a comma-separated list of words.

    Args:
        words: Comma-separated string of words

    Returns:
        JSONResponse: Information about each video's availability and metadata
    """
    try:
        word_list = [word.strip() for word in words.split(",") if word.strip()]
        if not word_list:
            raise HTTPException(status_code=400, detail="No valid words provided")

        video_files = []
        missing_words = []

        for word in word_list:
            try:
                video_path = await get_video_path(word)
                video_files.append(
                    {
                        "word": word,
                        "video_path": str(video_path),
                        "exists": True,
                        "file_size": (
                            os.path.getsize(video_path)
                            if os.path.exists(video_path)
                            else 0
                        ),
                    }
                )
                logging.info(f"Found video for word: {word}")
            except Exception as e:
                video_files.append(
                    {
                        "word": word,
                        "video_path": None,
                        "exists": False,
                        "error": str(e),
                    }
                )
                missing_words.append(word)
                logging.warning(f"No video found for word: {word}")

        return JSONResponse(
            {
                "message": f"Processed {len(word_list)} words",
                "words": word_list,
                "videos": video_files,
                "missing_words": missing_words,
                "success_count": len([v for v in video_files if v["exists"]]),
                "missing_count": len(missing_words),
            }
        )

    except Exception as e:
        logging.error(f"Failed to fetch multiple videos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch videos: {str(e)}")
