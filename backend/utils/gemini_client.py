"""Module for interacting with the Google Gemini AI model.

This module defines the GeminiClient class which wraps the Google GenAI SDK to generate sign language text from plain English sentences.

Functions:
- GeminiClient.__init__: Initializes the GeminiClient with API key.
- GeminiClient.generate_text: Asynchronously generates sign language text from a given English prompt.
"""

from google import genai
from utils.config import settings
import asyncio
# Note: You need to have the google genai package installed and GOOGLE_API_KEY set


class GeminiClient:
    """Client for interacting with the Google Gemini AI model.

    This client wraps the Google GenAI SDK to generate sign language text from plain English sentences.

    Attributes:
        client (genai.Client): The GenAI client initialized with API key.
        model_name (str): The name of the Gemini model to use.

    Example:
        >>> client = GeminiClient()
        >>> output = await client.generate_text("Hello world")
        >>> print(output)
    """

    def __init__(self):
        """Initialize the GeminiClient with the API key from settings."""
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model_name = "gemini-2.0-flash"

    async def generate_text(self, prompt: str) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._generate_sync, prompt)

    def _generate_sync(self, prompt: str) -> str:
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=f"""
            Remember: You just have to answer in concise manner with no extra thought.
            Convert the following plain English sentence to sign English:\n{prompt}""",
        )
        return response.text


# Usage example (not to be included in the module):
# client = GeminiClient()
# output = await client.generate_text("Hello world")
# print(output)
