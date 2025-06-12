"""Module providing middleware utilities.

This module contains middleware to sanitize incoming request data by recursively removing unsafe characters
from query parameters and JSON body.

Functions:
- sanitize_input: Async middleware function to sanitize request data.
"""

import re
from fastapi import Request

async def sanitize_input(request: Request, call_next):
    """Middleware to sanitize incoming request data.

    This middleware recursively sanitizes query parameters and JSON body data by removing any characters
    that are not alphanumeric, spaces, underscores, or hyphens.

    Args:
        request (Request): The incoming FastAPI request.
        call_next (Callable): The next middleware or route handler to call.

    Returns:
        Response: The response from the next middleware or route handler.

    Example:
        >>> # This middleware is automatically applied to all requests.
        >>> # It sanitizes input data to prevent injection attacks.
    """
    def sanitize(data):
        if isinstance(data, dict):
            return {k: sanitize(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [sanitize(i) for i in data]
        elif isinstance(data, str):
            return re.sub(r"[^a-zA-Z0-9 _-]", "", data)
        else:
            return data

    if request.query_params:
        sanitized_query = sanitize(dict(request.query_params))
        request._query_params = sanitized_query

    if request.method in ("POST", "PUT", "PATCH"):
        try:
            body = await request.json()
            sanitized_body = sanitize(body)
            request._body = sanitized_body
        except Exception:
            pass

    response = await call_next(request)
    return response
