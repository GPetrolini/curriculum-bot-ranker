# Backend

> Documentação voltada ao backend Python / FastAPI / serviços.

## Estrutura do backend

- `src/routes/` — rotas FastAPI (candidates, resume).
- `src/services/` — serviços de extração, análise e ranking (pdf_extractor, keyword_analyzer, ranking_engine, resume_service).
- `src/clients/` — integração externa com OpenAI.
- `src/database/` — persistência SQLAlchemy (models, repository, connection).
- `src/config/` — configurações da aplicação (settings).
- `src/main.py` — ponto de entrada da aplicação FastAPI com endpoints principais.

## Seções

- API
- Serviços
- Integrações

A navegação da barra lateral atende cada seção separada e comenta as funções reais ligadas ao código.
