import re
from pathlib import Path
from typing import Any, Dict, Optional

from config.settings import settings
from clients.openai_client import analyze_resume_text
from database.connection import SessionLocal
from database.models import Base
from database.repository import CandidateRepository, VacancyRepository
from services.pdf_extractor import PDFExtractor
from services.keyword_analyzer import KeywordAnalyzer
from services.ranking_engine import RankingEngine

extractor = PDFExtractor()
analyzer = KeywordAnalyzer()


def init_db() -> None:
    from database.connection import engine

    Base.metadata.create_all(bind=engine)


def parse_ai_analysis(result: Any) -> Dict[str, Any]:
    if result is None:
        return {}

    ai_data = result if isinstance(result, dict) else result

    skills = ai_data.get("skills") or ai_data.get("top_skills") or []
    if isinstance(skills, str):
        skills = [skill.strip() for skill in re.split(r"[,;\n]", skills) if skill.strip()]
    elif not isinstance(skills, list):
        skills = [str(skills)] if skills else []

    summary = ai_data.get("summary") or ai_data.get("resume_summary")
    if not summary:
        summary = ai_data.get("professional_summary")
    if not summary:
        summary = ai_data.get("professional_experience")

    years = ai_data.get("experience_years") or ai_data.get("years_experience") or ai_data.get("years")
    if isinstance(years, str):
        match = re.search(r"\d+", years)
        if match:
            years = int(match.group())
        else:
            years = None
    elif isinstance(years, float):
        years = int(years)
    elif isinstance(years, int):
        years = years
    else:
        years = None

    return {
        "summary": summary,
        "skills": skills,
        "experience_years": years,
        "raw_ai_response": ai_data,
    }


def get_or_create_vacancy(session):
    vacancy = VacancyRepository.get_by_title(session, settings.VACANCY_TITLE)
    if vacancy:
        return vacancy

    return VacancyRepository.create_vacancy(
        session,
        title=settings.VACANCY_TITLE,
        description=settings.VACANCY_DESCRIPTION,
        seniority=settings.VACANCY_SENIORITY,
        department=settings.VACANCY_DEPARTMENT,
        status=settings.VACANCY_STATUS,
        keywords=[
            {"keyword": "python", "keyword_type": "must_have", "keyword_weight": 10},
            {"keyword": "sql", "keyword_type": "must_have", "keyword_weight": 8},
            {"keyword": "rest", "keyword_type": "must_have", "keyword_weight": 7},
            {"keyword": "docker", "keyword_type": "nice_to_have", "keyword_weight": 5},
            {"keyword": "kubernetes", "keyword_type": "nice_to_have", "keyword_weight": 5},
        ],
    )


def process_resume_file(file_path: str) -> Dict[str, Any]:
    pdf_info = extractor.extract(Path(file_path))
    ai_analysis = analyze_resume_text(pdf_info["cleaned_text"])
    ai_data = parse_ai_analysis(ai_analysis)

    with SessionLocal() as session:
        vacancy = get_or_create_vacancy(session)
        keyword_analysis = analyzer.analyze_vacancy_keywords(
            pdf_info["cleaned_text"], vacancy.keywords
        )

        candidate_payload = {
            "full_name": pdf_info["full_name"],
            "email": pdf_info["email"],
            "phone": pdf_info["phone"],
            "age": None,
            "linkedin_url": pdf_info["linkedin_url"],
            "github_url": pdf_info["github_url"],
            "vacancy_applied": vacancy.title,
            "pdf_file_name": pdf_info["pdf_file_name"],
            "pdf_storage_url": pdf_info["pdf_storage_url"],
            "pdf_pages": pdf_info["pdf_pages"],
            "extracted_text": pdf_info["extracted_text"],
            "cleaned_text": pdf_info["cleaned_text"],
            "total_words": keyword_analysis["total_words"],
            "total_characters": keyword_analysis["total_characters"],
            "must_have_score": keyword_analysis["must_have_score"],
            "nice_to_have_score": keyword_analysis["nice_to_have_score"],
            "final_score": keyword_analysis["final_score"],
            "ranking_level": None,
            "ai_summary": ai_data.get("summary"),
            "ai_strengths": ", ".join(ai_data.get("skills", [])) if ai_data.get("skills") else None,
            "ai_weaknesses": None,
            "ai_seniority": (
                str(ai_data.get("experience_years"))
                if ai_data.get("experience_years") is not None
                else None
            ),
        }

        candidate_payload = RankingEngine.apply(candidate_payload)
        candidate = CandidateRepository.create_candidate(
            session,
            candidate_data=candidate_payload,
            keyword_records=keyword_analysis["keyword_records"],
        )

    return {
        "candidate_id": str(candidate.id),
        "name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "summary": candidate.ai_summary,
        "skills": ai_data.get("skills", []),
        "experience_years": ai_data.get("experience_years"),
        "final_score": candidate.final_score,
        "ranking_level": candidate.ranking_level,
    }


def analyze_existing_candidate(candidate_id: Optional[str] = None, file_name: Optional[str] = None) -> Dict[str, Any]:
    if not candidate_id and not file_name:
        raise ValueError("É necessário informar candidate_id ou file_name")

    with SessionLocal() as session:
        candidate = None
        if candidate_id:
            candidate = CandidateRepository.get_by_id(session, candidate_id)
        if not candidate and file_name:
            candidate = CandidateRepository.get_by_file_name(session, file_name)

        if not candidate:
            raise ValueError("Candidato não encontrado")

        text_to_use = candidate.cleaned_text or candidate.extracted_text
        if not text_to_use:
            raise ValueError("Texto do currículo não encontrado no banco de dados")

        ai_analysis = analyze_resume_text(text_to_use)
        ai_data = parse_ai_analysis(ai_analysis)

        updates = {
            "ai_summary": ai_data.get("summary"),
            "ai_strengths": ", ".join(ai_data.get("skills", [])) if ai_data.get("skills") else None,
            "ai_weaknesses": None,
            "ai_seniority": (
                str(ai_data.get("experience_years"))
                if ai_data.get("experience_years") is not None
                else None
            ),
        }

        candidate = CandidateRepository.update_candidate(session, candidate, updates)

        return {
            "candidate_id": str(candidate.id),
            "name": candidate.full_name,
            "email": candidate.email,
            "phone": candidate.phone,
            "summary": candidate.ai_summary,
            "skills": ai_data.get("skills", []),
            "experience_years": ai_data.get("experience_years"),
            "final_score": candidate.final_score,
            "ranking_level": candidate.ranking_level,
        }


def analyze_missing_candidates() -> Dict[str, Any]:
    processed_ids = []
    skipped_ids = []

    with SessionLocal() as session:
        candidates = CandidateRepository.get_without_ai_summary(session)
        for candidate in candidates:
            text_to_use = candidate.cleaned_text or candidate.extracted_text
            if not text_to_use:
                skipped_ids.append(str(candidate.id))
                continue

            ai_analysis = analyze_resume_text(text_to_use)
            ai_data = parse_ai_analysis(ai_analysis)

            updates = {
                "ai_summary": ai_data.get("summary"),
                "ai_strengths": ", ".join(ai_data.get("skills", []))
                if ai_data.get("skills")
                else None,
                "ai_weaknesses": None,
                "ai_seniority": (
                    str(ai_data.get("experience_years"))
                    if ai_data.get("experience_years") is not None
                    else None
                ),
            }

            candidate = CandidateRepository.update_candidate(session, candidate, updates)
            processed_ids.append(str(candidate.id))

    return {
        "processed": len(processed_ids),
        "processed_ids": processed_ids,
        "skipped": len(skipped_ids),
        "skipped_ids": skipped_ids,
        "missing_candidates": len(candidates),
    }


def get_candidate_info(candidate_id: Optional[str] = None, file_name: Optional[str] = None) -> Dict[str, Any]:
    if not candidate_id and not file_name:
        raise ValueError("É necessário informar candidate_id ou file_name")

    with SessionLocal() as session:
        candidate = None
        if candidate_id:
            candidate = CandidateRepository.get_by_id(session, candidate_id)
        if not candidate and file_name:
            candidate = CandidateRepository.get_by_file_name(session, file_name)

        if not candidate:
            raise ValueError("Candidato não encontrado")

        return {
            "candidate_id": str(candidate.id),
            "name": candidate.full_name,
            "email": candidate.email,
            "phone": candidate.phone,
            "summary": candidate.ai_summary,
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
            "final_score": candidate.final_score,
            "ranking_level": candidate.ranking_level,
        }
