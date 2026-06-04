# Backend / API

Esta página explica as rotas do backend e mostra os trechos reais das funções que elas usam.

## `GET /candidates/`

Implementado em `src/routes/candidate_routes.py`.

A função `list_candidates()` abre uma sessão SQLAlchemy, consulta todos os candidatos e serializa cada registro com `serialize_candidate()`:

```python
@router.get("/")
def list_candidates():
    with SessionLocal() as session:
        candidates = CandidateRepository.get_all(session)

    return {
        "status": "success",
        "candidates": [serialize_candidate(candidate) for candidate in candidates],
    }
```

O método `serialize_candidate()` transforma o modelo em JSON e calcula o campo `skills` a partir de `ai_strengths`.

## `POST /resume/analyze`

Implementado em `src/routes/resume_routes.py`. Ele recebe `candidate_id` ou `file_name` e chama `analyze_existing_candidate()`.

```python
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
```

A função `analyze_existing_candidate()` está em `src/services/resume_service.py` e atualiza apenas o candidato existente.

## `POST /resume/analyze-missing`

Endpoint para análise em lote, também em `src/routes/resume_routes.py`.

```python
@router.post("/analyze-missing")
async def analyze_missing_resumes():
    try:
        result = analyze_missing_candidates()
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

`analyze_missing_candidates()` em `src/services/resume_service.py` percorre o banco buscando candidatos sem `ai_summary` e atualiza apenas esses registros.

## `GET /resume/info`

Retorna dados de análise de IA já armazenados para um candidato, consultando por `candidate_id` ou `file_name`.

```python
@router.get("/info")
async def get_resume_info(candidate_id: Optional[str] = None, file_name: Optional[str] = None):
    try:
        info = get_candidate_info(candidate_id=candidate_id, file_name=file_name)
        return {"status": "success", **info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```
