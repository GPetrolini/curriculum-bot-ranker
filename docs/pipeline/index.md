# 🔀 Pipelines do Sistema

Esta página detalha os fluxos de arquitetura do projeto. O sistema é dividido em duas grandes esteiras: a **Pipeline da Aplicação** (responsável por receber, extrair e ranquear currículos em tempo real) e a **Pipeline de Analytics** (responsável por orquestrar a carga de dados para o Data Warehouse no GCP).

---

## 1. Pipeline da Aplicação (Backend & IA)

Este fluxo representa o processamento do currículo assim que ele entra no sistema.

### Fluxo principal

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

### Sequência de análise (API)

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

---

## 2. Pipeline de Analytics (Data Engineering / Airflow)

Após o processamento pela API, a nossa esteira de dados entra em ação de forma assíncrona. A orquestração é feita pelo **Apache Airflow** (`02_carga_analytics_bq`), aplicando o conceito de ELT (Extract, Load, Transform).

### Arquitetura Cloud e Fluxo (ELT)
1. **Extract:** O Airflow conecta no PostgreSQL (Neon) e extrai os dados processados (candidatos e vagas).
2. **Load (GCS):** Os dados são exportados em CSV e enviados para a camada *Staging* do nosso Data Lake no Google Cloud Storage.
3. **Load (BigQuery):** O BigQuery ingere nativamente os dados do bucket, disponibilizando-os para dashboards e BI.

### Diagrama de Analytics e Data Lake

::: mermaid
graph LR
    A[(PostgreSQL\nNeon)] -->|Exportação Airflow| B(CSVs Temporários)
    B -->|Upload| C[GCP Cloud Storage\nData Lake]
    C -->|Ingestão Nativa| D[(BigQuery\nData Warehouse)]
    
    style A fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#1A73E8,stroke:#fff,stroke-width:2px,color:#fff
:::

---

## Observação
Os diagramas usam o plugin `mermaid2` configurado em `mkdocs.yml`. Se não renderizar, abra o servidor local em `127.0.0.1:8001` e recarregue a página.

