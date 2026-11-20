"""Request dependencies: the signed-in user."""

from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_session
from app.core.errors import AppError
from app.modules.auth.service import user_by_session
from app.modules.users.models import User

DbSession = Annotated[AsyncSession, Depends(get_session)]


async def current_user(request: Request, db: DbSession) -> User:
    token = request.cookies.get(get_settings().session_cookie)
    user = await user_by_session(db, token) if token else None
    if user is None:
        raise AppError("not_authenticated", "Войдите в аккаунт.", 401)
    return user


CurrentUser = Annotated[User, Depends(current_user)]
