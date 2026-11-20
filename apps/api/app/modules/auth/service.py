"""Registration, sessions and password reset."""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.security import (
    DUMMY_HASH,
    hash_password,
    hash_token,
    needs_rehash,
    new_token,
    verify_password,
)
from app.modules.notifications.email import send_email
from app.modules.users.models import AuthToken, Session, User

RESET_TOKEN_TTL = timedelta(hours=1)
RESET_KIND = "reset_password"


def now() -> datetime:
    return datetime.now(UTC)


@dataclass(frozen=True)
class ClientInfo:
    ip: str | None
    user_agent: str | None


async def create_session(db: AsyncSession, user: User, client: ClientInfo) -> str:
    token = new_token()
    ts = now()
    db.add(
        Session(
            user_id=user.id,
            token_hash=hash_token(token),
            ip=client.ip,
            user_agent=(client.user_agent or "")[:300] or None,
            created_at=ts,
            last_seen_at=ts,
            expires_at=ts + timedelta(days=get_settings().session_days),
        )
    )
    return token


async def register(
    db: AsyncSession, email: str, password: str, full_name: str, client: ClientInfo
) -> tuple[User, str]:
    user = User(email=email.lower(), password_hash=hash_password(password), full_name=full_name)
    db.add(user)
    try:
        await db.flush()
    except IntegrityError as exc:
        await db.rollback()
        raise AppError(
            "email_taken", "Этот email уже зарегистрирован. Войдите или восстановите пароль.", 409
        ) from exc
    token = await create_session(db, user, client)
    await db.commit()
    return user, token


async def login(
    db: AsyncSession, email: str, password: str, client: ClientInfo
) -> tuple[User, str]:
    user = await db.scalar(select(User).where(User.email == email.lower()))
    if user is None:
        verify_password(DUMMY_HASH, password)  # same timing as a wrong password
        raise AppError("invalid_credentials", "Неверный email или пароль.", 401)
    if not verify_password(user.password_hash, password):
        raise AppError("invalid_credentials", "Неверный email или пароль.", 401)
    if user.status != "active":
        raise AppError("account_blocked", "Доступ к аккаунту ограничен. Напишите в поддержку.", 403)
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)
    token = await create_session(db, user, client)
    await db.commit()
    return user, token


async def user_by_session(db: AsyncSession, token: str) -> User | None:
    ts = now()
    session = await db.scalar(
        select(Session).where(
            Session.token_hash == hash_token(token),
            Session.revoked_at.is_(None),
            Session.expires_at > ts,
        )
    )
    if session is None:
        return None
    user = await db.get(User, session.user_id)
    if user is None or user.status != "active":
        return None
    if ts - session.last_seen_at > timedelta(minutes=5):
        session.last_seen_at = ts
        await db.commit()
    return user


async def logout(db: AsyncSession, token: str) -> None:
    await db.execute(
        update(Session)
        .where(Session.token_hash == hash_token(token), Session.revoked_at.is_(None))
        .values(revoked_at=now())
    )
    await db.commit()


async def revoke_all_sessions(db: AsyncSession, user_id: object) -> None:
    await db.execute(
        update(Session)
        .where(Session.user_id == user_id, Session.revoked_at.is_(None))
        .values(revoked_at=now())
    )


async def request_password_reset(db: AsyncSession, email: str) -> None:
    """Always succeeds for the caller, so nobody can probe which emails exist."""
    user = await db.scalar(select(User).where(User.email == email.lower()))
    if user is None or user.status != "active":
        return
    token = new_token()
    ts = now()
    db.add(
        AuthToken(
            user_id=user.id,
            kind=RESET_KIND,
            token_hash=hash_token(token),
            created_at=ts,
            expires_at=ts + RESET_TOKEN_TTL,
        )
    )
    await db.commit()
    link = f"{get_settings().web_url}/reset-password?token={token}"
    await send_email(
        user.email,
        "Восстановление доступа к ADMINO",
        f"Здравствуйте, {user.full_name}!\n\n"
        f"Чтобы задать новый пароль, откройте ссылку (действует 1 час):\n{link}\n\n"
        "Если вы не запрашивали восстановление, просто проигнорируйте это письмо.",
    )


async def reset_password(db: AsyncSession, token: str, password: str) -> None:
    ts = now()
    record = await db.scalar(
        select(AuthToken)
        .where(
            AuthToken.token_hash == hash_token(token),
            AuthToken.kind == RESET_KIND,
            AuthToken.used_at.is_(None),
            AuthToken.expires_at > ts,
        )
        .with_for_update()
    )
    if record is None:
        raise AppError(
            "invalid_token", "Ссылка устарела или уже использована. Запросите новую.", 400
        )
    user = await db.get(User, record.user_id)
    if user is None:
        raise AppError(
            "invalid_token", "Ссылка устарела или уже использована. Запросите новую.", 400
        )
    user.password_hash = hash_password(password)
    record.used_at = ts
    await revoke_all_sessions(db, user.id)
    await db.commit()
