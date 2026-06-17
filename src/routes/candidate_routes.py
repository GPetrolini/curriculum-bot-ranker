from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.connection import SessionLocal
from database.models import CandidateModel
from database.repository import CandidateRepository

router = APIRouter()


class InterviewSelectionRequest(BaseModel):
    candidate_ids: List[UUID]


class InterviewSelectionUpdate(BaseModel):
    selected_for_interview: Optional[bool] = None
    interview_selected_at: Optional[datetime] = None


def serialize_candidate(candidate) -> dict:
    return {
        "candidate_id": str(candidate.id),
        "full_name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "age": candidate.age,
        "linkedin_url": candidate.linkedin_url,
        "github_url": candidate.github_url,
        "vacancy_applied": candidate.vacancy_applied,
        "pdf_file_name": candidate.pdf_file_name,
        "pdf_storage_url": candidate.pdf_storage_url,
        "pdf_pages": candidate.pdf_pages,
        "extracted_text": candidate.extracted_text,
        "cleaned_text": candidate.cleaned_text,
        "total_words": candidate.total_words,
        "total_characters": candidate.total_characters,
        "must_have_score": candidate.must_have_score,
        "nice_to_have_score": candidate.nice_to_have_score,
        "final_score": candidate.final_score,
        "ranking_level": candidate.ranking_level,
        "ai_summary": candidate.ai_summary,
        "ai_strengths": candidate.ai_strengths,
        "ai_weaknesses": candidate.ai_weaknesses,
        "ai_seniority": candidate.ai_seniority,
        "selected_for_interview": candidate.selected_for_interview,
        "interview_selected_at": candidate.interview_selected_at,
        "skills": [
            skill.strip()
            for skill in (candidate.ai_strengths or "").split(",")
            if skill.strip()
        ],
        "experience_years": (
            int(candidate.ai_seniority)
            if candidate.ai_seniority and candidate.ai_seniority.isdigit()
            else None
        ),
    }


@router.get("/")
def list_candidates():
    with SessionLocal() as session:
        candidates = CandidateRepository.get_all(session)

    return {
        "status": "success",
        "candidates": [serialize_candidate(candidate) for candidate in candidates],
    }


@router.post("/interview-selection")
def select_candidates_for_interview(payload: InterviewSelectionRequest):
    from datetime import datetime
    selected_candidates = []

    with SessionLocal() as session:
        for candidate_id in payload.candidate_ids:
            candidate = (
                session.query(CandidateModel)
                .filter(CandidateModel.id == candidate_id)
                .first()
            )

            if not candidate:
                raise HTTPException(
                    status_code=404,
                    detail=f"Candidato {candidate_id} não encontrado",
                )

            candidate.selected_for_interview = True
            candidate.interview_selected_at = datetime.utcnow()
            selected_candidates.append(candidate)

        session.commit()

        for candidate in selected_candidates:
            session.refresh(candidate)

        return {
            "status": "success",
            "message": "Candidatos selecionados para entrevista com sucesso",
            "selected_candidates": [
                serialize_candidate(candidate) for candidate in selected_candidates
            ],
        }


@router.put("/{candidate_id}/interview-selection")
def update_interview_selection(candidate_id: str, update: InterviewSelectionUpdate):
    with SessionLocal() as session:
        candidate = session.query(CandidateModel).filter(
            CandidateModel.id == candidate_id
        ).first()
        
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidato não encontrado")
        
        if update.selected_for_interview is not None:
            candidate.selected_for_interview = update.selected_for_interview
        
        if update.interview_selected_at is not None:
            candidate.interview_selected_at = update.interview_selected_at
        
        session.commit()
        session.refresh(candidate)
    
    return {
        "status": "success",
        "candidate": serialize_candidate(candidate)
    }
