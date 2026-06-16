from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from database.connection import SessionLocal
from database.repository import CandidateRepository
from database.models import CandidateModel

router = APIRouter()


class InterviewSelectionUpdate(BaseModel):
    select_for_interview: Optional[bool] = None
    interview_select_atc: Optional[bool] = None


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
        "select_for_interview": candidate.select_for_interview,
        "interview_select_atc": candidate.interview_select_atc,
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


@router.put("/{candidate_id}/interview-selection")
def update_interview_selection(candidate_id: str, update: InterviewSelectionUpdate):
    with SessionLocal() as session:
        candidate = session.query(CandidateModel).filter(
            CandidateModel.id == candidate_id
        ).first()
        
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidato não encontrado")
        
        if update.select_for_interview is not None:
            candidate.select_for_interview = update.select_for_interview
        
        if update.interview_select_atc is not None:
            candidate.interview_select_atc = update.interview_select_atc
        
        session.commit()
        session.refresh(candidate)
    
    return {
        "status": "success",
        "candidate": serialize_candidate(candidate)
    }