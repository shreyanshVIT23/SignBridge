"""Module for application configuration settings.

This module defines the Settings class using Pydantic BaseSettings to manage application configuration
such as host, port, video directory, Gemini API key, and CORS origins. It also provides a singleton instance `settings` for use
throughout the application.

Classes:
- Settings: Configuration settings for the application.
"""

from typing import List
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    """Configuration settings for the application.

    This class dynamically loads all environment variables from the .env file as attributes.
    It inherits from Pydantic's BaseSettings which automatically reads environment variables and
    allows for type validation and parsing.

    Attributes:
        host (str): The host address to bind the server. Defaults to '0.0.0.0'.
        port (int): The port number to bind the server. Defaults to 8000.
        video_dir (Path): Absolute directory path where video files are stored.
        gemini_api_key (str): API key for Gemini AI model.
        cors_origins (List[str]): List of allowed CORS origins.

    Note:
        With `extra = 'allow'` in the Config class, any other environment variables
        present in the .env file or environment will also be accessible as attributes
        on instances of this class.

    Example:
        >>> settings = Settings()
        >>> print(settings.host)
        0.0.0.0
        >>> print(settings.some_custom_env_var)  # dynamically loaded from .env
    """
    host: str = "0.0.0.0"
    port: int = 8000
    video_dir: Path = BASE_DIR / "assets"
    gemini_api_key: str
    cors_origins: List[str] = []

    class Config:
        env_file = ".env"
        extra = 'allow'

settings = Settings()
"""Instance of Settings to be used throughout the application."""
