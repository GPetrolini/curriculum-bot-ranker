"""add processed_at to raw_resumes

Revision ID: add_processed_at
Revises: e2b734c7f348
Create Date: 2026-06-10 17:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_processed_at'
down_revision: Union[str, Sequence[str], None] = 'e2b734c7f348'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('raw_resumes', sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('raw_resumes', 'processed_at')
