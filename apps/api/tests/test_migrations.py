"""Every migration must apply and roll back cleanly on an empty database."""

import subprocess
import sys


def _alembic(*args: str) -> None:
    subprocess.run([sys.executable, "-m", "alembic", *args], check=True)  # noqa: S603


def test_migrations_upgrade_downgrade_upgrade() -> None:
    _alembic("upgrade", "head")
    _alembic("downgrade", "base")
    _alembic("upgrade", "head")
