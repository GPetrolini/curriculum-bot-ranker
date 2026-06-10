import os
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://admin:adminpassword@localhost:5432/cv_ranker_db",
    )
    ASSETS_PATH: Path = Path(os.getenv("ASSETS_PATH", PROJECT_ROOT / "assets"))
    VACANCY_TITLE: str = os.getenv("VACANCY_TITLE", "Software Engineer")
    VACANCY_DESCRIPTION: str = os.getenv(
        "VACANCY_DESCRIPTION", "Vaga de tecnologia para desenvolver soluções modernas."
    )
    VACANCY_SENIORITY: str = os.getenv("VACANCY_SENIORITY", "Pleno")
    VACANCY_DEPARTMENT: str = os.getenv("VACANCY_DEPARTMENT", "Engenharia")
    VACANCY_STATUS: str = os.getenv("VACANCY_STATUS", "active")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    BACKGROUND_WORKER_INTERVAL: int = int(os.getenv("BACKGROUND_WORKER_INTERVAL", "30"))


settings = Settings()
