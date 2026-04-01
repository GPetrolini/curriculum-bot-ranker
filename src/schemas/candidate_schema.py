from pydantic import BaseModel


class Candidate(BaseModel):
    name: str
    email: str