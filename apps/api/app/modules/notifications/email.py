"""Outgoing email. Development uses Mailpit over SMTP; tests use an in-memory outbox."""

from dataclasses import dataclass
from email.message import EmailMessage

import aiosmtplib

from app.core.config import get_settings


@dataclass(frozen=True)
class SentEmail:
    to: str
    subject: str
    text: str


outbox: list[SentEmail] = []


async def send_email(to: str, subject: str, text: str) -> None:
    settings = get_settings()
    if settings.email_backend == "memory":
        outbox.append(SentEmail(to=to, subject=subject, text=text))
        return
    message = EmailMessage()
    message["From"] = settings.email_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    await aiosmtplib.send(
        message,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=settings.smtp_tls,
    )
