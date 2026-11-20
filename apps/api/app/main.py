"""ADMINO API entry point."""

from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_session
from app.core.errors import register_error_handlers
from app.core.logging import configure_logging, register_request_logging

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title="ADMINO API",
        version="0.1.0",
        docs_url=None if settings.is_production else f"{API_PREFIX}/docs",
        openapi_url=f"{API_PREFIX}/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_request_logging(app)
    register_error_handlers(app)

    router = APIRouter(prefix=API_PREFIX)

    @router.get("/health", tags=["system"])
    async def health(session: Annotated[AsyncSession, Depends(get_session)]) -> dict[str, str]:
        await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "ok"}

    app.include_router(router)
    return app


app = create_app()
