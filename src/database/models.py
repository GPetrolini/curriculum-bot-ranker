import uuid
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

class VacancyModel(Base):
    __tablename__ = "vacancies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    seniority = Column(String(50), nullable=True)
    department = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)

    keywords = relationship("VacancyKeywordModel", back_populates="vacancy", cascade="all, delete-orphan")


class VacancyKeywordModel(Base):
    __tablename__ = "vacancy_keywords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vacancy_id = Column(UUID(as_uuid=True), ForeignKey("vacancies.id"), nullable=False)
    keyword = Column(String(255), nullable=False)
    keyword_type = Column(String(50), nullable=True) # must_have ou nice_to_have
    keyword_weight = Column(Integer, nullable=True)

    vacancy = relationship("VacancyModel", back_populates="keywords")


class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    linkedin_url = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    vacancy_applied = Column(String(255), nullable=True)
    pdf_file_name = Column(String(255), nullable=True)
    pdf_storage_url = Column(Text, nullable=True)
    pdf_pages = Column(Integer, nullable=True)
    extracted_text = Column(Text, nullable=True)
    cleaned_text = Column(Text, nullable=True)
    total_words = Column(Integer, nullable=True)
    total_characters = Column(Integer, nullable=True)
    must_have_score = Column(Integer, nullable=True)
    nice_to_have_score = Column(Integer, nullable=True)
    final_score = Column(Integer, nullable=True)
    ranking_level = Column(String(50), nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_strengths = Column(Text, nullable=True)
    ai_weaknesses = Column(Text, nullable=True)
    ai_seniority = Column(String(50), nullable=True)

    keywords = relationship("CandidateKeywordModel", back_populates="candidate", cascade="all, delete-orphan")


class CandidateKeywordModel(Base):
    __tablename__ = "candidate_keywords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    keyword = Column(String(255), nullable=False)
    occurrences = Column(Integer, nullable=True)
    keyword_type = Column(String(50), nullable=True)
    keyword_weight = Column(Integer, nullable=True)
    keyword_score = Column(Integer, nullable=True)

    candidate = relationship("CandidateModel", back_populates="keywords")