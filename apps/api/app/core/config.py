"""Application settings. Secrets come only from environment variables."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="ADMINO_", extra="ignore")

    environment: Literal["development", "test", "production"] = "development"
    database_url: PostgresDsn = Field(
        default=PostgresDsn("postgresql+asyncpg://admino:admino@localhost:5432/admino"),
    )
    secret_key: str = Field(default="dev-only-change-me", min_length=16)
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: str = "INFO"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.is_production and settings.secret_key == "dev-only-change-me":  # noqa: S105
        raise RuntimeError("ADMINO_SECRET_KEY must be set in production")
    return settings
