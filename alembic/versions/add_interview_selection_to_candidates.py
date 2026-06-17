"""add interview selection fields to candidates

Revision ID: add_interview_selection_to_candidates
Revises: 
Create Date: 2026-06-16
"""

from alembic import op
import sqlalchemy as sa


revision = "add_interview_selection"
down_revision = "add_processed_at"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "candidates",
        sa.Column(
            "selected_for_interview",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "candidates",
        sa.Column(
            "interview_selected_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column("candidates", "interview_selected_at")
    op.drop_column("candidates", "selected_for_interview")