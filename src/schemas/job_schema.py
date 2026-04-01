from pydantic import BaseModel
from typing import List


class Job(BaseModel):
    title: str
    required_skills: List[str]