from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    required_skills = Column(Text, nullable=False)

    rankings = relationship("RankingModel", back_populates="job")


class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(Text, nullable=False)
    experience_years = Column(Integer, nullable=True)

    rankings = relationship("RankingModel", back_populates="candidate")


class RankingModel(Base):
    __tablename__ = "rankings"

    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float, nullable=False)
    
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)

    candidate = relationship("CandidateModel", back_populates="rankings")
    job = relationship("JobModel", back_populates="rankings")