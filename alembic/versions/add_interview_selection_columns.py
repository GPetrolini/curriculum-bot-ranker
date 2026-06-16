"""add interview selection columns to candidates

Revision ID: add_interview_selection
Revises: add_processed_at
Create Date: 2026-06-16 20:47:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_interview_selection'
down_revision: Union[str, Sequence[str], None] = 'add_processed_at'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('candidates', sa.Column('select_for_interview', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('candidates', sa.Column('interview_select_atc', sa.Boolean(), nullable=True, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('candidates', 'interview_select_atc')
    op.drop_column('candidates', 'select_for_interview')
