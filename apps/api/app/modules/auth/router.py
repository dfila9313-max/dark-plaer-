from fastapi import APIRouter, Request, Response, status

from app.core.config import get_settings
from app.core.rate_limit import login_limiter, password_reset_limiter, register_limiter
from app.modules.auth import service
from app.modules.auth.deps import CurrentUser, DbSession
from app.modules.auth.schemas import (
    ForgotPasswordIn,
    LoginIn,
    RegisterIn,
    ResetPasswordIn,
    UserOut,
)

router = APIRouter(tags=["auth"])


def _client(request: Request) -> service.ClientInfo:
    forwarded = request.headers.get("x-forwarded-for")
    ip = (
        forwarded.split(",")[0].strip()
        if forwarded
        else (request.client.host if request.client else None)
    )
    return service.ClientInfo(ip=ip, user_agent=request.headers.get("user-agent"))


def _set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        settings.session_cookie,
        token,
        max_age=settings.session_days * 24 * 3600,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
    )


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterIn, request: Request, response: Response, db: DbSession
) -> UserOut:
    client = _client(request)
    register_limiter.hit(f"ip:{client.ip}")
    user, token = await service.register(db, body.email, body.password, body.full_name, client)
    _set_session_cookie(response, token)
    return UserOut.model_validate(user)


@router.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response, db: DbSession) -> UserOut:
    client = _client(request)
    login_limiter.hit(f"email:{body.email.lower()}")
    login_limiter.hit(f"ip:{client.ip}")
    user, token = await service.login(db, body.email, body.password, client)
    _set_session_cookie(response, token)
    return UserOut.model_validate(user)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request, response: Response, db: DbSession) -> None:
    settings = get_settings()
    token = request.cookies.get(settings.session_cookie)
    if token:
        await service.logout(db, token)
    response.delete_cookie(settings.session_cookie, path="/")


@router.post("/auth/password/forgot", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(
    body: ForgotPasswordIn, request: Request, db: DbSession
) -> dict[str, str]:
    password_reset_limiter.hit(f"email:{body.email.lower()}")
    password_reset_limiter.hit(f"ip:{_client(request).ip}")
    await service.request_password_reset(db, body.email)
    return {"status": "sent_if_exists"}


@router.post("/auth/password/reset", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(body: ResetPasswordIn, db: DbSession) -> None:
    await service.reset_password(db, body.token, body.password)


@router.get("/me")
async def me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)
