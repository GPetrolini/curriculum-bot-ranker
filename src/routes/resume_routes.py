import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.resume_service import (
    analyze_existing_candidate,
    analyze_missing_candidates,
    get_candidate_info,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


class ResumeAnalyzeRequest(BaseModel):
    candidate_id: Optional[str] = None
    file_name: Optional[str] = None


@router.post("/analyze")
async def analyze_resume(request: ResumeAnalyzeRequest):
    try:
        logger.info(f"Iniciando análise para candidate_id={request.candidate_id}, file_name={request.file_name}")
        analysis_result = analyze_existing_candidate(
            candidate_id=request.candidate_id,
            file_name=request.file_name,
        )
        logger.info(f"Análise concluída para candidate_id={analysis_result['candidate_id']}, nome={analysis_result['name']}")

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
        logger.error(f"Erro na análise: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analyze-missing")
async def analyze_missing_resumes():
    try:
        logger.info("Iniciando análise de currículos pendentes")
        result = analyze_missing_candidates()
        logger.info(f"Análise concluída: {result['processed']} processados, {result['skipped']} pulados")
        return {"status": "success", **result}
    except Exception as e:
        logger.error(f"Erro na análise de currículos pendentes: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/info")
async def get_resume_info(candidate_id: Optional[str] = None, file_name: Optional[str] = None):
    try:
        info = get_candidate_info(candidate_id=candidate_id, file_name=file_name)
        return {"status": "success", **info}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))