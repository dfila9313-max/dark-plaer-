"""CSRF protection for cookie sessions.

Session cookies are SameSite=Lax, and on top of that every state-changing
request must come from one of our own origins (Origin, or Referer as fallback).
"""

from collections.abc import Awaitable, Callable
from urllib.parse import urlsplit

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse

from app.core.config import get_settings

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def _origin_of(url: str) -> str:
    parts = urlsplit(url)
    return f"{parts.scheme}://{parts.netloc}"


def register_csrf_protection(app: FastAPI) -> None:
    @app.middleware("http")
    async def check_origin(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        if request.method not in SAFE_METHODS:
            allowed = {
                _origin_of(o) for o in [*get_settings().cors_origins, get_settings().web_url]
            }
            source = request.headers.get("origin") or request.headers.get("referer")
            if not source or _origin_of(source) not in allowed:
                return JSONResponse(
                    {
                        "error": {
                            "code": "csrf_failed",
                            "message": "Запрос отклонён.",
                            "request_id": None,
                        }
                    },
                    status_code=403,
                )
        return await call_next(request)
