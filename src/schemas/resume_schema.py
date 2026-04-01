from pydantic import BaseModel
from typing import List, Optional


class ResumeAnalysis(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    summary: Optional[str]
    skills: List[str]
    experience_years: Optional[int]