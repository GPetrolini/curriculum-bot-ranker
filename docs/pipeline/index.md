# 🔀 Pipelines do Sistema

Esta página detalha os fluxos de arquitetura do projeto. O sistema é dividido em duas grandes esteiras: a **Pipeline da Aplicação** (responsável por receber, extrair e ranquear currículos em tempo real) e a **Pipeline de Analytics** (responsável por orquestrar a carga de dados para o Data Warehouse no GCP).

---

## 1. Pipeline da Aplicação (Backend & IA)

Este fluxo representa o processamento do currículo assim que ele entra no sistema.

### Fluxo principal

```mermaid
flowchart LR
    Bot[Bot WhatsApp] -->|Upload PDF| RawDB[(PostgreSQL<br/>raw_resumes)]
    RawDB -->|POST /process| API[FastAPI]
    API -->|Query raw_resumes| RawDB
    RawDB -->|Retorna bytes| API
    API -->|PDFExtractor.extract<br/>bytes| Extract[Extração Texto]
    Extract -->|cleaned_text| Keywords[KeywordAnalyzer<br/>analyze_vacancy_keywords]
    Keywords -->|final_score| Rank[RankingEngine<br/>apply]
    Rank -->|candidate_payload| Persist[CandidateRepository<br/>create_candidate]
    Persist -->|INSERT| CandDB[(PostgreSQL<br/>candidates)]
    CandDB -->|POST /resume/analyze-missing| API
    API -->|Query sem ai_summary| CandDB
    CandDB -->|Retorna candidatos| API
    API -->|analyze_existing_candidate| ResumeService[ResumeService]
    ResumeService -->|extracted_text| OpenAI[OpenAI Client]
    OpenAI -->|ai_analysis| ResumeService
    ResumeService -->|UPDATE| CandDB
```

### Sequência de processamento (POST /process)

```mermaid
sequenceDiagram
    participant Bot as Bot WhatsApp
    participant RawDB as PostgreSQL (raw_resumes)
    participant API as FastAPI
    participant Extractor as PDFExtractor
    participant Analyzer as KeywordAnalyzer
    participant Ranker as RankingEngine
    participant CandDB as PostgreSQL (candidates)

    Bot->>RawDB: INSERT PDF (file_content, file_name)
    API->>RawDB: SELECT * FROM raw_resumes
    RawDB-->>API: Retorna lista de PDFs
    API->>Extractor: extract(bytes, file_name)
    Extractor-->>API: Retorna dados extraídos
    API->>Analyzer: analyze_vacancy_keywords(cleaned_text)
    Analyzer-->>API: Retorna scores e keywords
    API->>Ranker: apply(candidate_payload)
    Ranker-->>API: Adiciona ranking_level
    API->>CandDB: INSERT candidate
    CandDB-->>API: Candidato criado
    API-->>Bot: Processamento concluído
```

---

## 2. Pipeline de Analytics (Data Engineering / Airflow)

Após o processamento pela API, a nossa esteira de dados entra em ação de forma assíncrona. A orquestração é feita pelo **Apache Airflow** (`02_carga_analytics_bq`), aplicando o conceito de ELT (Extract, Load, Transform).

### Arquitetura Cloud e Fluxo (ELT)
1. **Extract:** O Airflow conecta no PostgreSQL (Neon) e extrai os dados processados (candidatos e vagas).
2. **Load (GCS):** Os dados são exportados em CSV e enviados para a camada *Staging* do nosso Data Lake no Google Cloud Storage.
3. **Load (BigQuery):** O BigQuery ingere nativamente os dados do bucket, disponibilizando-os para dashboards e BI.

### Diagrama de Analytics e Data Lake

```mermaid
graph LR
    A[(PostgreSQL\nNeon)] -->|Exportação Airflow| B(CSVs Temporários)
    B -->|Upload| C[GCP Cloud Storage\nData Lake]
    C -->|Ingestão Nativa| D[(BigQuery\nData Warehouse)]

    style A fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#1A73E8,stroke:#fff,stroke-width:2px,color:#fff
```

---

## Observação
Os diagramas usam o plugin `mermaid2` configurado em `mkdocs.yml`. Se não renderizar, abra o servidor local em `127.0.0.1:8001` e recarregue a página.

