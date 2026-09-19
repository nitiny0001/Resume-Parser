"""Initial resume intelligence schema.

Revision ID: 0001
Revises:
"""

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id UUID PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            content_type VARCHAR(120) NOT NULL,
            extracted_text TEXT,
            profile JSONB,
            embedding VECTOR(1536),
            status VARCHAR(32) NOT NULL DEFAULT 'uploaded',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_resumes_status ON resumes (status)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_resumes_status")
    op.execute("DROP TABLE IF EXISTS resumes")
