from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.services.resume_service import analyze_existing_candidate, get_candidate_info

router = APIRouter()


class ResumeAnalyzeRequest(BaseModel):
    candidate_id: Optional[str] = None
    file_name: Optional[str] = None


@router.post("/analyze")
async def analyze_resume(request: ResumeAnalyzeRequest):
    try:
        analysis_result = analyze_existing_candidate(
            candidate_id=request.candidate_id,
            file_name=request.file_name,
        )

        return {
            "status": "success",
            "candidate_id": analysis_result["candidate_id"],
            "name": analysis_result["name"],
            "email": analysis_result["email"],
            "phone": analysis_result["phone"],
            "summary": analysis_result["summary"],
            "skills": analysis_result["skills"],
            "experience_years": analysis_result["experience_years"],
            "final_score": analysis_result["final_score"],
            "ranking_level": analysis_result["ranking_level"],
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/info")
async def get_resume_info(candidate_id: Optional[str] = None, file_name: Optional[str] = None):
    try:
        info = get_candidate_info(candidate_id=candidate_id, file_name=file_name)
        return {"status": "success", **info}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))