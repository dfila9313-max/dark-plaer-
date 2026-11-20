"""Small in-process sliding-window rate limiter.

Enough for one API instance (MVP). When the API runs in several processes,
swap the storage for PostgreSQL or Redis behind the same interface.
"""

import time
from collections import defaultdict, deque

from app.core.errors import AppError


class RateLimiter:
    def __init__(self, limit: int, window_seconds: float) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def hit(self, key: str) -> None:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > self.window:
            hits.popleft()
        if len(hits) >= self.limit:
            raise AppError(
                "rate_limited", "Слишком много попыток. Попробуйте через несколько минут.", 429
            )
        hits.append(now)

    def reset(self) -> None:
        self._hits.clear()


login_limiter = RateLimiter(limit=10, window_seconds=15 * 60)
password_reset_limiter = RateLimiter(limit=5, window_seconds=60 * 60)
register_limiter = RateLimiter(limit=10, window_seconds=60 * 60)
