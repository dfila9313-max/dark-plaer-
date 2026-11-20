"""Tests run against a real PostgreSQL (see ADMINO_DATABASE_URL), never mocks."""

import os
import subprocess
import sys
from collections.abc import AsyncIterator

os.environ.setdefault("ADMINO_ENVIRONMENT", "test")
os.environ["ADMINO_EMAIL_BACKEND"] = "memory"

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.core import rate_limit  # noqa: E402
from app.core.db import get_engine  # noqa: E402
from app.main import create_app  # noqa: E402
from app.modules.notifications.email import outbox  # noqa: E402

WEB_ORIGIN = "http://localhost:3000"


@pytest.fixture(scope="session", autouse=True)
def migrated_db() -> None:
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)  # noqa: S603


@pytest.fixture(autouse=True)
async def clean_state() -> AsyncIterator[None]:
    outbox.clear()
    for limiter in (
        rate_limit.login_limiter,
        rate_limit.password_reset_limiter,
        rate_limit.register_limiter,
    ):
        limiter.reset()
    yield
    async with get_engine().begin() as conn:
        await conn.execute(text("TRUNCATE users CASCADE"))


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    app = create_app()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test", headers={"origin": WEB_ORIGIN}
    ) as c:
        yield c
