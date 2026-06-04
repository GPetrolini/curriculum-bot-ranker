# Banco de Dados

Esta seção descreve os modelos SQLAlchemy e o repositório usado pelo backend.

## Modelos principais

`src/database/models.py` define `CandidateModel`, `CandidateKeywordModel`, `VacancyModel` e `VacancyKeywordModel`.

Trecho de `CandidateModel`:

```python
class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    vacancy_applied = Column(String(255), nullable=True)
    extracted_text = Column(Text, nullable=True)
    cleaned_text = Column(Text, nullable=True)
    final_score = Column(Integer, nullable=True)
    ranking_level = Column(String(50), nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_strengths = Column(Text, nullable=True)
```

## Repositório

`src/database/repository.py` contém métodos de consulta e atualização.

Trecho de `CandidateRepository`:

```python
@staticmethod
def get_without_ai_summary(db: Session) -> List[CandidateModel]:
    return db.query(CandidateModel).filter(CandidateModel.ai_summary.is_(None)).all()

@staticmethod
def update_candidate(db: Session, candidate: CandidateModel, updates: Dict) -> CandidateModel:
    for key, value in updates.items():
        setattr(candidate, key, value)

    db.commit()
    db.refresh(candidate)
    return candidate
```

A função `create_candidate()` também adiciona os registros de `CandidateKeywordModel` com `keyword_score`, `occurrences` e `keyword_type`.
