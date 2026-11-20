"""Enable PostgreSQL extensions used across the schema.

btree_gist  - exclusion constraint against double booking (stage 5)
citext      - case-insensitive emails and slugs (stage 2)

Revision ID: 0001
Revises:
Create Date: 2026-11-20
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS citext")
    op.execute("DROP EXTENSION IF EXISTS btree_gist")
