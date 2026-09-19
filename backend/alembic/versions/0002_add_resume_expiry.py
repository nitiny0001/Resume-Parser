"""Add resume retention expiry timestamps.

Revision ID: 0002
Revises: 0001
"""

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("resumes", op.Column("expires_at", op.DateTime(timezone=True), nullable=True))
    op.execute(
        """
        UPDATE resumes
        SET expires_at = created_at + interval '30 days'
        WHERE expires_at IS NULL
        """
    )
    op.alter_column("resumes", "expires_at", nullable=False)
    op.create_index("ix_resumes_expires_at", "resumes", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_resumes_expires_at", table_name="resumes")
    op.drop_column("resumes", "expires_at")
