from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List


app = FastAPI(
    title="Curriculum Bot Ranker API",
    description="API REST para análise e ranqueamento de currículos",
    version="1.0.0"
)


class Candidate(BaseModel):
    id: int
    name: str
    score: float
    skills: List[str]


candidates = [
    {
        "id": 1,
        "name": "Ana Silva",
        "score": 92.5,
        "skills": ["Python", "SQL", "Machine Learning"]
    },
    {
        "id": 2,
        "name": "Carlos Souza",
        "score": 85.0,
        "skills": ["Java", "Docker", "AWS"]
    },
    {
        "id": 3,
        "name": "Marina Lima",
        "score": 78.5,
        "skills": ["React", "Node.js", "TypeScript"]
    }
]


@app.get("/")
def home():
    return {
        "message": "API REST do Curriculum Bot Ranker está funcionando"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.get("/candidates")
def list_candidates():
    return {
        "total": len(candidates),
        "candidates": candidates
    }


@app.get("/candidates/{candidate_id}")
def get_candidate(candidate_id: int):
    for candidate in candidates:
        if candidate["id"] == candidate_id:
            return candidate

    raise HTTPException(
        status_code=404,
        detail="Candidato não encontrado"
    )


@app.post("/candidates")
def create_candidate(candidate: Candidate):
    for existing_candidate in candidates:
        if existing_candidate["id"] == candidate.id:
            raise HTTPException(
                status_code=400,
                detail="Já existe um candidato com esse ID"
            )

    candidates.append(candidate.model_dump())

    return {
        "message": "Candidato criado com sucesso",
        "candidate": candidate
    }


@app.get("/ranking")
def get_ranking():
    ranking = sorted(
        candidates,
        key=lambda candidate: candidate["score"],
        reverse=True
    )

    return {
        "ranking": ranking
    }


@app.get("/skills")
def list_skills():
    all_skills = []

    for candidate in candidates:
        all_skills.extend(candidate["skills"])

    unique_skills = sorted(set(all_skills))

    return {
        "total": len(unique_skills),
        "skills": unique_skills
    }