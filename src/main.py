from pathlib import Path
from typing import List
from datetime import datetime
import threading
import requests

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from config.settings import settings
from database.connection import SessionLocal, engine
from database.models import Base, CandidateModel, VacancyModel, RawResumeModel
from database.repository import CandidateRepository, VacancyRepository
from routes.candidate_routes import router as candidate_router
from routes.resume_routes import router as resume_router
from services.keyword_analyzer import KeywordAnalyzer
from services.pdf_extractor import PDFExtractor
from services.ranking_engine import RankingEngine

app = FastAPI(title="CV Ranker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resume_router, prefix="/resume", tags=["resume"])
app.include_router(candidate_router, prefix="/candidates", tags=["candidates"])


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    # Rodar migrações pendentes
    try:
        from alembic.config import Config
        from alembic import command
        
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception as e:
        print(f"Aviso: Não foi possível rodar migrações automaticamente: {e}")
    
    # Iniciar background worker como thread
    def run_worker():
        import time
        import logging
        logger = logging.getLogger(__name__)
        api_url = "http://localhost:8000/process"
        interval = getattr(settings, 'BACKGROUND_WORKER_INTERVAL', 30)
        
        logger.info(f"Iniciando background worker (intervalo: {interval}s)")
        
        while True:
            try:
                response = requests.post(api_url, timeout=30)
                if response.status_code == 200:
                    result = response.json()
                    processed = result.get("processed", 0)
                    if processed > 0:
                        logger.info(f"Worker: {processed} PDFs processados")
                time.sleep(interval)
            except Exception as exc:
                logger.error(f"Worker error: {exc}")
                time.sleep(interval)
    
    worker_thread = threading.Thread(target=run_worker, daemon=True)
    worker_thread.start()
    print("Background worker iniciado como thread daemon")


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


def process_pdf_from_db(raw_resume: RawResumeModel, vacancy: VacancyModel, session) -> CandidateModel:
    raw_payload = extractor.extract(raw_resume.file_content, raw_resume.file_name)
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
    try:
        init_db()

        processed_ids: List[str] = []
        with SessionLocal() as session:
            vacancy = get_or_create_vacancy(session)

            raw_resumes = session.query(RawResumeModel).filter(
                RawResumeModel.status == "pending"
            ).all()

            print(f"Encontrados {len(raw_resumes)} PDFs pendentes na tabela raw_resumes")

            if not raw_resumes:
                return {"processed": 0, "message": "Nenhum PDF pendente encontrado na tabela raw_resumes"}

            for raw_resume in raw_resumes:
                print(f"Processando: {raw_resume.file_name}")
                existing = CandidateRepository.get_by_file_name(session, raw_resume.file_name)
                if existing:
                    print(f"Já existe candidato para {raw_resume.file_name}, marcando como processado...")
                    raw_resume.status = "processed"
                    raw_resume.processed_at = datetime.utcnow()
                    session.commit()
                    continue

                try:
                    candidate = process_pdf_from_db(raw_resume, vacancy, session)
                    raw_resume.status = "processed"
                    raw_resume.processed_at = datetime.utcnow()
                    session.commit()
                    processed_ids.append(str(candidate.id))
                    print(f"Sucesso: {raw_resume.file_name}")
                except SQLAlchemyError as exc:
                    session.rollback()
                    raw_resume.status = "error"
                    session.commit()
                    print(f"Falha ao salvar candidato para {raw_resume.file_name}: {exc}")
                except Exception as exc:
                    session.rollback()
                    raw_resume.status = "error"
                    session.commit()
                    print(f"Falha no processamento de {raw_resume.file_name}: {exc}")

        return {"processed": len(processed_ids), "candidate_ids": processed_ids}
    except Exception as exc:
        print(f"Erro geral no process_assets: {exc}")
        raise


def print_best_candidates(vacancy_title: str) -> None:
    with SessionLocal() as session:
        candidates = (
            session.query(CandidateModel)
            .filter(CandidateModel.vacancy_applied == vacancy_title)
            .order_by(CandidateModel.final_score.desc())
            .all()
        )

        if not candidates:
            print("Nenhum candidato processado para exibir.")
            return

        print("\n=== Ranking de currículos ===")
        for candidate in candidates:
            print(
                f"{candidate.full_name} - Score: {candidate.final_score} - Nível: {candidate.ranking_level}"
            )


@app.get("/")
def root() -> dict:
    return {"message": "CV Ranker API is ready"}


@app.post("/process")
def run_processing() -> dict:
    return process_assets()


if __name__ == "__main__":
    result = process_assets()
    print(result)

    with SessionLocal() as session:
        vacancy = get_or_create_vacancy(session)
        print_best_candidates(vacancy.title)
