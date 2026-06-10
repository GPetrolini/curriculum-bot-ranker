# Testes

> Documentação dos testes unitários e BDD do curriculum-bot-ranker.

## Seções principais

- `Unitários` — testes unitários dos serviços e componentes.
- `Integração` — testes de integração e BDD.

## Como navegar

Use a barra lateral para abrir cada área. Cada página contém:
- explicação em texto
- função/arquivo real do código
- trechos de código relevantes

---

## Visão geral dos testes

O sistema possui testes unitários e BDD para validar o comportamento dos principais componentes, incluindo extração de PDFs, análise de keywords, cálculo de score e ranking, e endpoints da API.

### Estrutura dos testes

```
tests/
├── test_api.py                    # Testes da API FastAPI
├── test_keyword_analyzer.py       # Testes do KeywordAnalyzer
├── test_pdf_extractor.py          # Testes do PDFExtractor
├── test_scoring_and_ranking.py    # Testes do ScoringService e RankingEngine
├── test_scoring_and_ranking_bdd.py # Testes BDD
└── features/
    └── scoring_and_ranking.feature # Cenários BDD
```

---

## Tecnologias

- **pytest** — Framework de testes unitários
- **pytest-bdd** — Framework de testes BDD (Behavior Driven Development)
- **unittest.mock** — Mocking para testes isolados
- **FastAPI TestClient** — Cliente de teste para a API

---

## Executar testes

### Executar todos os testes unitários

```bash
pytest
```

### Executar testes com coverage

```bash
pytest --cov=src --cov-report=html
```

### Executar testes BDD

```bash
pytest --gherkin-terminal-reporter
```

### Executar testes específicos

```bash
pytest tests/test_keyword_analyzer.py
pytest tests/test_pdf_extractor.py
pytest tests/test_scoring_and_ranking.py
```

---

## Cobertura de testes

Os testes cobrem os principais componentes do sistema:
- **PDFExtractor**: extração de texto, limpeza de texto, extração de informações de contato
- **KeywordAnalyzer**: análise de keywords, cálculo de scores, contagem de ocorrências
- **ScoringService**: cálculo de score com base em skills
- **RankingEngine**: determinação de ranking e aplicação ao payload
- **API**: endpoints da FastAPI (GET /, GET /candidates)
