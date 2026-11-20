import re

from httpx import AsyncClient

from app.modules.notifications.email import outbox

USER = {
    "email": "Owner@Example.com",
    "password": "correct-horse-1",
    "full_name": "  Дмитрий   Антонов ",
}


async def register(client: AsyncClient, **overrides: str) -> dict[str, object]:
    response = await client.post("/api/v1/auth/register", json={**USER, **overrides})
    assert response.status_code == 201, response.text
    return response.json()


async def test_register_logs_in_and_normalises(client: AsyncClient) -> None:
    body = await register(client)
    assert body["email"] == "owner@example.com"
    assert body["full_name"] == "Дмитрий Антонов"
    assert "password_hash" not in body
    me = await client.get("/api/v1/me")
    assert me.status_code == 200
    assert me.json()["email"] == "owner@example.com"


async def test_session_cookie_is_http_only(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/register", json=USER)
    cookie = response.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=lax" in cookie


async def test_duplicate_email_is_rejected_case_insensitively(client: AsyncClient) -> None:
    await register(client)
    response = await client.post(
        "/api/v1/auth/register", json={**USER, "email": "OWNER@example.com"}
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "email_taken"


async def test_short_password_is_rejected(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/register", json={**USER, "password": "short"})
    assert response.status_code == 422


async def test_logout_then_login(client: AsyncClient) -> None:
    await register(client)
    assert (await client.post("/api/v1/auth/logout")).status_code == 204
    client.cookies.clear()
    assert (await client.get("/api/v1/me")).status_code == 401
    bad = await client.post(
        "/api/v1/auth/login", json={"email": USER["email"], "password": "wrong-password"}
    )
    assert bad.status_code == 401
    assert bad.json()["error"]["code"] == "invalid_credentials"
    good = await client.post(
        "/api/v1/auth/login", json={"email": "owner@example.com", "password": USER["password"]}
    )
    assert good.status_code == 200
    assert (await client.get("/api/v1/me")).status_code == 200


async def test_unknown_email_gives_same_error_as_wrong_password(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "whatever-1"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_credentials"


async def test_revoked_session_cookie_no_longer_works(client: AsyncClient) -> None:
    await register(client)
    token = client.cookies.get("admino_session")
    await client.post("/api/v1/auth/logout")
    client.cookies.set("admino_session", token or "")
    assert (await client.get("/api/v1/me")).status_code == 401


async def test_password_reset_flow(client: AsyncClient) -> None:
    await register(client)
    old_session = client.cookies.get("admino_session")
    response = await client.post("/api/v1/auth/password/forgot", json={"email": USER["email"]})
    assert response.status_code == 202
    assert len(outbox) == 1
    match = re.search(r"token=([\w-]+)", outbox[0].text)
    assert match
    token = match.group(1)

    reset = await client.post(
        "/api/v1/auth/password/reset", json={"token": token, "password": "new-password-2"}
    )
    assert reset.status_code == 204
    # every old session is signed out
    client.cookies.set("admino_session", old_session or "")
    assert (await client.get("/api/v1/me")).status_code == 401
    # the link works only once
    again = await client.post(
        "/api/v1/auth/password/reset", json={"token": token, "password": "another-pass-3"}
    )
    assert again.status_code == 400
    # new password works, old does not
    client.cookies.clear()
    old = await client.post(
        "/api/v1/auth/login", json={"email": USER["email"], "password": USER["password"]}
    )
    assert old.status_code == 401
    new = await client.post(
        "/api/v1/auth/login", json={"email": USER["email"], "password": "new-password-2"}
    )
    assert new.status_code == 200


async def test_forgot_password_does_not_reveal_unknown_emails(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/password/forgot", json={"email": "nobody@example.com"}
    )
    assert response.status_code == 202
    assert outbox == []


async def test_login_is_rate_limited(client: AsyncClient) -> None:
    await register(client)
    client.cookies.clear()
    codes = []
    for _ in range(11):
        r = await client.post(
            "/api/v1/auth/login", json={"email": USER["email"], "password": "wrong-password"}
        )
        codes.append(r.status_code)
    assert codes[-1] == 429
    assert set(codes[:10]) == {401}


async def test_foreign_origin_is_blocked(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": USER["email"], "password": USER["password"]},
        headers={"origin": "https://evil.example"},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "csrf_failed"
