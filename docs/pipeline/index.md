# Pipeline

Esta página mostra os fluxos do sistema e os diagramas relacionados ao processamento de currículos.

## Fluxo principal

::: mermaid
flowchart LR
    Files[Arquivos em assets/*.pdf] --> Extract[PDFExtractor.extract]
    Extract --> Keywords[KeywordAnalyzer.analyze_vacancy_keywords]
    Keywords --> Rank[RankingEngine.apply]
    Rank --> Persist[CandidateRepository.create_candidate]
    Persist --> DB[(Postgres)]
    DB --> AnalyzeMissing[POST /resume/analyze-missing]
    AnalyzeMissing --> OpenAI[clients.openai_client.analyze_resume_text]
    OpenAI --> Update[CandidateRepository.update_candidate]
    Update --> DB
:::

## Sequência de análise

::: mermaid
sequenceDiagram
    User->>API: POST /resume/analyze
    API->>ResumeService: analyze_existing_candidate()
    ResumeService->>OpenAI: analyze_resume_text()
    OpenAI-->>ResumeService: JSON result
    ResumeService->>DB: update_candidate()
    DB-->>ResumeService: updated model
    ResumeService-->>API: response payload
:::

## Observação

Os diagramas usam o plugin `mermaid2` configurado em `mkdocs.yml`. Se não renderizar, abra o servidor local em `127.0.0.1:8001` e recarregue a página.
