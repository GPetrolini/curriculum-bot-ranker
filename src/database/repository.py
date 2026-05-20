from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from .models import (
    CandidateKeywordModel,
    CandidateModel,
    VacancyKeywordModel,
    VacancyModel,
)


class VacancyRepository:

    @staticmethod
    def get_by_title(db: Session, title: str) -> Optional[VacancyModel]:
        return db.query(VacancyModel).filter(VacancyModel.title == title).first()

    @staticmethod
    def get_keywords(db: Session, vacancy_id: str) -> List[VacancyKeywordModel]:
        vacancy = db.query(VacancyModel).filter(VacancyModel.id == vacancy_id).first()
        return vacancy.keywords if vacancy else []

    @staticmethod
    def create_vacancy(
        db: Session,
        title: str,
        description: str,
        seniority: str,
        department: str,
        status: str,
        keywords: List[Dict],
    ) -> VacancyModel:
        vacancy = VacancyModel(
            title=title,
            description=description,
            seniority=seniority,
            department=department,
            status=status,
        )

        for keyword in keywords:
            vacancy.keywords.append(
                VacancyKeywordModel(
                    keyword=keyword["keyword"],
                    keyword_type=keyword.get("keyword_type", "nice_to_have"),
                    keyword_weight=keyword.get("keyword_weight", 1),
                )
            )

        db.add(vacancy)
        db.commit()
        db.refresh(vacancy)
        return vacancy


class CandidateRepository:

    @staticmethod
    def get_by_file_name(db: Session, file_name: str) -> Optional[CandidateModel]:
        return db.query(CandidateModel).filter(CandidateModel.pdf_file_name == file_name).first()

    @staticmethod
    def create_candidate(
        db: Session,
        candidate_data: Dict,
        keyword_records: List[Dict],
    ) -> CandidateModel:
        candidate = CandidateModel(**candidate_data)

        for keyword in keyword_records:
            candidate.keywords.append(
                CandidateKeywordModel(
                    keyword=keyword["keyword"],
                    occurrences=keyword["occurrences"],
                    keyword_type=keyword["keyword_type"],
                    keyword_weight=keyword["keyword_weight"],
                    keyword_score=keyword["keyword_score"],
                )
            )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        return candidate
