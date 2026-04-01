from pydantic import BaseModel


class Ranking(BaseModel):
    candidate_name: str
    score: float