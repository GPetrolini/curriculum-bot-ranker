# Backend

> Documentação voltada ao backend Python / FastAPI / serviços.

## Estrutura do backend

- `src/routes/` — rotas FastAPI (candidates, resume).
- `src/services/` — serviços de extração, análise e ranking (pdf_extractor, keyword_analyzer, ranking_engine, resume_service).
- `src/clients/` — integração externa com OpenAI.
- `src/database/` — persistência SQLAlchemy (models, repository, connection).
- `src/config/` — configurações da aplicação (settings).
- `src/main.py` — ponto de entrada da aplicação FastAPI com endpoints principais.

## Fluxo do Backend

```mermaid
graph LR
    A[Bot WhatsApp] -->|Upload PDF| B[(PostgreSQL<br/>raw_resumes)]
    B -->|POST /process| C[FastAPI<br/>PDFExtractor]
    C -->|cleaned_text| D[KeywordAnalyzer]
    D -->|scores| E[RankingEngine]
    E -->|candidate| F[(PostgreSQL<br/>candidates)]
    F -->|POST /resume/analyze-missing| G[ResumeService]
    G -->|extracted_text| H[OpenAI]
    H -->|ai_analysis| I[(PostgreSQL<br/>candidates atualizados)]

    style B fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    style F fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    style I fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#FF9800,stroke:#fff,stroke-width:2px,color:#fff
    style E fill:#FF9800,stroke:#fff,stroke-width:2px,color:#fff
    style G fill:#9C27B0,stroke:#fff,stroke-width:2px,color:#fff
    style H fill:#9C27B0,stroke:#fff,stroke-width:2px,color:#fff
```

## Seções

- API
- Serviços
- Integrações

A navegação da barra lateral atende cada seção separada e comenta as funções reais ligadas ao código.
