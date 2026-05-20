from pathlib import Path
from typing import List

from fastapi import FastAPI
from sqlalchemy.exc import SQLAlchemyError

from config.settings import settings
from database.connection import SessionLocal, engine
from database.models import Base, CandidateModel, VacancyModel
from database.repository import CandidateRepository, VacancyRepository
from services.keyword_analyzer import KeywordAnalyzer
from services.pdf_extractor import PDFExtractor
from services.ranking_engine import RankingEngine

app = FastAPI(title="CV Ranker API")

extractor = PDFExtractor()
analyzer = KeywordAnalyzer()

DEFAULT_VACANCY_KEYWORDS = [
    {"keyword": "python", "keyword_type": "must_have", "keyword_weight": 10},
    {"keyword": "sql", "keyword_type": "must_have", "keyword_weight": 8},
    {"keyword": "rest", "keyword_type": "must_have", "keyword_weight": 7},
    {"keyword": "docker", "keyword_type": "nice_to_have", "keyword_weight": 5},
    {"keyword": "kubernetes", "keyword_type": "nice_to_have", "keyword_weight": 5},
]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_or_create_vacancy(session) -> VacancyModel:
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
        keywords=DEFAULT_VACANCY_KEYWORDS,
    )


def process_pdf(pdf_path: Path, vacancy: VacancyModel, session) -> CandidateModel:
    raw_payload = extractor.extract(pdf_path)
    analysis = analyzer.analyze_vacancy_keywords(raw_payload["cleaned_text"], vacancy.keywords)

    candidate_payload = {
        "full_name": raw_payload["full_name"],
        "email": raw_payload["email"],
        "phone": raw_payload["phone"],
        "age": None,
        "linkedin_url": raw_payload["linkedin_url"],
        "github_url": raw_payload["github_url"],
        "vacancy_applied": vacancy.title,
        "pdf_file_name": raw_payload["pdf_file_name"],
        "pdf_storage_url": raw_payload["pdf_storage_url"],
        "pdf_pages": raw_payload["pdf_pages"],
        "extracted_text": raw_payload["extracted_text"],
        "cleaned_text": raw_payload["cleaned_text"],
        "total_words": analysis["total_words"],
        "total_characters": analysis["total_characters"],
        "must_have_score": analysis["must_have_score"],
        "nice_to_have_score": analysis["nice_to_have_score"],
        "final_score": analysis["final_score"],
        "ranking_level": None,
        "ai_summary": None,
        "ai_strengths": None,
        "ai_weaknesses": None,
        "ai_seniority": None,
    }

    candidate_payload = RankingEngine.apply(candidate_payload)

    return CandidateRepository.create_candidate(
        session,
        candidate_data=candidate_payload,
        keyword_records=analysis["keyword_records"],
    )


def process_assets() -> dict:
    init_db()
    source_path = Path(settings.ASSETS_PATH)
    pdf_files = sorted(source_path.glob("*.pdf"))

    if not pdf_files:
        return {"processed": 0, "message": "Nenhum PDF encontrado em assets/"}

    processed_ids: List[str] = []
    with SessionLocal() as session:
        vacancy = get_or_create_vacancy(session)
        for pdf_path in pdf_files:
            existing = CandidateRepository.get_by_file_name(session, pdf_path.name)
            if existing:
                continue

            try:
                candidate = process_pdf(pdf_path, vacancy, session)
                processed_ids.append(str(candidate.id))
            except SQLAlchemyError as exc:
                raise RuntimeError(f"Falha ao salvar candidato para {pdf_path.name}: {exc}") from exc
            except Exception as exc:
                print(f"Falha no processamento de {pdf_path.name}: {exc}")

    return {"processed": len(processed_ids), "candidate_ids": processed_ids}


@app.get("/")
def root() -> dict:
    return {"message": "CV Ranker API is ready"}


@app.post("/process")
def run_processing() -> dict:
    return process_assets()


if __name__ == "__main__":
    result = process_assets()
    print(result)
