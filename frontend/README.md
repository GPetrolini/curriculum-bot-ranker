# CV Ranker - AI Resume Analyzer

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Apache Airflow](https://img.shields.io/badge/Airflow-017CEE?style=for-the-badge&logo=Apache%20Airflow&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![MkDocs](https://img.shields.io/badge/MkDocs-000000?style=for-the-badge&logo=markdown&logoColor=white)

> Ferramenta automatizada de leitura, estruturação e ranqueamento de currículos impulsionada por Inteligência Artificial (LLMs).

**Status:** *Este projeto está em fase ativa de desenvolvimento. Backend e Frontend estão operantes com funcionalidades principais implementadas. O sistema de ranking de candidatos, filtros por vaga e integração de seleção para entrevista estão em produção. Melhorias de UI/UX e testes estão em progresso.*

---

## Sobre o Projeto

Projeto desenvolvido para a Unidade Curricular de **Gestão de Qualidade de Software** do curso de Análise e Desenvolvimento de Sistemas.

* **Instituição:** UNISUL - Florianópolis, SC.
* **Professor:** Prof. Dr. Saulo Popov Zambiasi

### Equipe de Desenvolvimento

* **Gustavo Petrolini** (10724112917) - Engenharia de Dados / Cloud / Banco de Dados
* **Gustavo Perino** (1072412639) - Backend & IA
* **Leonardo Vivan** (1072416471) - Frontend
* **Tiago Machado** (1072410017) - Frontend 
* **Natã Batista** (1072415016) - Backend & Integração IA / Pipeline BDD

---

## Módulos do Monorepo

O repositório abriga todas as frentes do projeto. Cada desenvolvedor atua em seu respectivo escopo técnico:

### 1. Engenharia de Dados (Gustavo Petrolini)
* **Tecnologias:** Python, Apache Airflow, Docker, Google Cloud Storage, PostgreSQL (Neon).
* **Status Atual:**
  * Infraestrutura de orquestração local via Docker Compose (Webserver, Scheduler).
  * Criação do Pipeline de Ingestão (DAGs) conectando dados brutos locais ao Data Lake no GCP.
  * Injeção de credenciais de nuvem automatizada via variáveis de ambiente.
  * Banco PostgreSQL Neon configurado para produção.

### 2. Backend & IA (Gustavo Perino / Natã Batista)
* **Tecnologias:** Python, FastAPI, OpenAI, SQLAlchemy, Docker, PostgreSQL (Neon).
* **Status Atual:**
  * API FastAPI implementada com rotas de análise e consulta de candidatos.
  * Integração com OpenAI para gerar resumo de currículo, seniority e skills a partir do texto armazenado no banco.
  * Serviço Docker dedicado `backend` disponível em `docker-compose.yaml`.
  * Suporte a variáveis de ambiente via `.env` para `DATABASE_URL`, `OPENAI_API_KEY` e demais credenciais.
  * Conexão com banco PostgreSQL Neon para produção.

### 3. Frontend (Leonardo Vivan & Tiago Machado)
* **Tecnologias:** HTML5, CSS3, Vanilla JavaScript.
* **Status Atual:**
  * Interface funcional e responsiva implementada.
  * Sistema de busca, filtros por vaga e ordenação por score operante.
  * Painel de "Selecionados" com abas para "Entrevistas" e "Contratados".
  * Integração completa com API REST (GET `/candidates`, POST `/candidates/interview-selection`).
  * Algoritmo de ranking visual com badges de cor (Excelente, Bom, Mediano, Fraco).
  * Paginação de candidatos com persistência de filtros e ordenação.
  * Armazenamento local de seleções em localStorage com sincronização com backend.
  * Correções recentes: score limitado em 100, filtros com word-boundary, ordenação consistente entre páginas.

### 4. ChatBot WhatsApp (Natã Batista)
* **Tecnologias:** Node.js, Electron, whatsapp-web.js, PostgreSQL.
* **Status Atual:**
  * Bot de WhatsApp para download automático de currículos em PDF.
  * Interface Electron desktop para monitoramento e controle.
  * Integração com banco PostgreSQL para armazenamento de metadados.
  * Filtro inteligente de currículos por nome de arquivo.
  * Documentação completa em `docs/chatbot-whatsapp/`.

---

## Escopo e Arquitetura

O **CV Ranker** visa acelerar o processo de triagem em processos seletivos, reduzindo drasticamente o tempo de leitura humana e padronizando a avaliação dos candidatos de forma técnica e imparcial.

### O Fluxo de Dados e Processamento:
1. **Ingestão:** O currículo (PDF) chega através do **ChatBot WhatsApp** ou upload manual e é armazenado de forma segura, acionando a API.
2. **Extração & Score:** O Backend extrai o texto do PDF e o analisa através de um motor de pontuação (Score), buscando as habilidades obrigatórias (`must_have`) e desejáveis (`nice_to_have`).
3. **Análise Semântica (IA):** Integração com **OpenAI** para leitura humana avançada, gerando um resumo profissional e definindo a senioridade do candidato.
4. **Armazenamento:** Persistência dos dados estruturados e notas em um banco **PostgreSQL (Neon)**.
5. **Analytics:** O **Apache Airflow** orquestra o pipeline ETL, extrai os dados processados e realiza a carga no Data Lake/Data Warehouse (**Google Cloud Platform**) para geração de dashboards e métricas do RH.

### Algoritmo de Ranqueamento

O motor de *ranking* avalia a compatibilidade do candidato com a vaga seguindo esta régua de notas (Score):

* **80+ pontos** ➔ `EXCELENTE`
* **50 a 79 pontos** ➔ `BOM`
* **30 a 49 pontos** ➔ `MEDIANO`
* **0 a 29 pontos** ➔ `FRACO`

---

## Melhorias Recentes (Frontend)

### Correções de Bugs e Otimizações
- **Score Display**: Score exibido limitado em 100 no frontend (gambiarra visual para bug do backend)
- **Race Condition - Aba Selecionados**: Implementado sistema de `dataLoaded` flag e função `updateCurrentView()` para garantir que a aba "Selecionados" renderiza corretamente mesmo quando acessada durante o carregamento inicial
- **Ordenação Consistente**: Extraída função `getFilteredAndSortedList()` que centraliza a lógica de filtro e ordenação, eliminando inversões de ordem ao trocar de página
- **Filtros por Vaga**: Modificado `matchesVaga()` para usar word-boundary (`\b`) em vez de `includes()` solto, evitando falsos positivos com keywords curtas
- **Seleção para Entrevista**: Integração completa com endpoint `POST /candidates/interview-selection` para salvar candidatos no backend

---

O projeto utiliza um fluxo de trabalho baseado em branches para organizar o desenvolvimento:

- **main** - Branch principal estável. Contém código pronto para produção.
- **develop** - Branch de desenvolvimento. Integra features antes de ir para main.
- **feature/*** - Branches para desenvolvimento de novas funcionalidades específicas.
- **chatbot-whatsapp** - Branch dedicada ao desenvolvimento do ChatBot WhatsApp.

O fluxo padrão é: desenvolver em branches `feature/*`, fazer merge para `develop`, e depois fazer merge de `develop` para `main` após aprovação.

---

## Como Executar Localmente

### Pré-requisitos
* `Docker` e `Docker Compose` instalados.
* Uma conta no GCP (Google Cloud) e chave da API OpenAI.
* Python 3.11+ (para execução local sem Docker).

### 1. Clonar o Repositório
```bash
git clone https://github.com/GPetrolini/curriculum-bot-ranker.git
cd curriculum-bot-ranker
```

### 2. Configuração de Variáveis
Crie uma cópia do `.env.example` e renomeie para `.env`.

```bash
cp .env.example .env
```

Preencha o `.env` com as credenciais do GCP e demais chaves da aplicação:
- `DATABASE_URL` - URL de conexão com PostgreSQL Neon
- `OPENAI_API_KEY` - Chave da API OpenAI
- `GCP_PROJECT_ID` - ID do projeto Google Cloud
- `ASSETS_PATH` - Caminho para pasta de PDFs
- `VACANCY_TITLE`, `VACANCY_DESCRIPTION`, `VACANCY_SENIORITY`, `VACANCY_DEPARTMENT`, `VACANCY_STATUS` - Dados da vaga

### 3. Subir a Infraestrutura com Docker

Para subir toda a stack (Postgres + backend + Airflow):

```bash
docker compose up -d
```

Airflow UI: `http://localhost:8080`

Para subir apenas o backend:

```bash
docker compose up -d backend
```

Para testar apenas o backend e reconstruir a imagem:

```bash
docker compose up --build backend
```

### 3. Executar o Frontend

O frontend está em `frontend/` e roda diretamente no navegador sem build step necessário.

**Option A: Local (sem Docker)**
```bash
cd frontend
# Servir a pasta com um servidor HTTP simples (Python 3)
python -m http.server 8001
```

Frontend disponível em: `http://localhost:8001`

**Option B: Docker**
```bash
docker compose up -d frontend
```

### 4. Executar Localmente (Backend sem Docker)

Criar ambiente virtual:

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

Instalar dependências:

```bash
pip install -r requirements.txt
```

Inicializar banco de dados:

```bash
alembic upgrade head
```

Executar API:

```bash
uvicorn src.main:app --reload
```

API disponível em: `http://localhost:8000`

### 6. ChatBot WhatsApp

O ChatBot WhatsApp é uma aplicação Electron separada. Para executá-lo:

```bash
cd ChatBot-para-WhatsApp
npm install
npm start
```

Para mais informações sobre o ChatBot WhatsApp, consulte a documentação em `docs/chatbot-whatsapp/`.

---

## Testes

Este projeto usa `pytest` para testes automatizados e também inclui cenários no padrão BDD com `pytest-bdd`.

### O que está coberto
- **Testes unitários** em `tests/`:
  - `test_pdf_extractor.py` - Valida extração de texto e informações de contato de PDFs
  - `test_keyword_analyzer.py` - Testa análise de keywords e cálculo de scores
  - `test_scoring_and_ranking.py` - Valida o cálculo de score e determinação de ranking
  - `test_api.py` - Testa os endpoints da API FastAPI
- **Testes BDD** em `tests/features/`:
  - `scoring_and_ranking.feature` - Cenários BDD para cálculo de score e ranking
  - Implementação em `test_scoring_and_ranking_bdd.py`

### Como executar
Executar todos os testes:
```bash
pytest
```

Executar testes com coverage:
```bash
pytest --cov=src --cov-report=html
```

Executar testes específicos:
```bash
pytest tests/test_keyword_analyzer.py
pytest tests/test_pdf_extractor.py
pytest tests/test_scoring_and_ranking.py
```

### Documentação de Testes
Para mais informações sobre os testes, consulte a documentação em `docs/tests/`.

### Testes do ChatBot WhatsApp
O ChatBot WhatsApp usa Jest para testes unitários e Cucumber para testes BDD.

Executar todos os testes do chatbot:
```bash
cd ChatBot-para-WhatsApp
npm test
```

Executar testes em modo watch:
```bash
cd ChatBot-para-WhatsApp
npm run test:watch
```

Executar testes com coverage:
```bash
cd ChatBot-para-WhatsApp
npm run test:coverage
```

Para mais informações sobre os testes do chatbot, consulte a documentação em `docs/chatbot-whatsapp/tests/`.

---

## Documentação
A documentação técnica do projeto é gerada automaticamente usando **MkDocs** e publicada no **GitHub Pages**.

### Estrutura da Documentação
- `docs/index.md` - Página principal
- `docs/backend/` - Documentação do Backend (API, Serviços, Integrações)
- `docs/frontend/` - Documentação do Frontend
- `docs/database/` - Documentação do Banco de Dados
- `docs/pipeline/` - Documentação do Pipeline ETL
- `docs/chatbot-whatsapp/` - Documentação do ChatBot WhatsApp
- `docs/tests/` - Documentação de Testes

### Executar Documentação Localmente
```bash
pip install -r requirements-docs.txt
mkdocs serve
```

Documentação disponível em: `http://127.0.0.1:8000/`

### Deploy Automático
A documentação é publicada automaticamente no GitHub Pages quando há push para a branch `main` via GitHub Actions. O workflow está configurado em `.github/workflows/deploy-docs.yml`.

---

## Guia de Contribuição e Versionamento
Este repositório segue práticas rigorosas de CI/CD e revisão de código.

### Fluxo de Trabalho (GitHub Flow)
A branch `main` é protegida. O desenvolvimento de novas features ocorre em branches isoladas e é integrado via Pull Request (PR).

1. Crie uma branch a partir da `main` (`feature/nome-da-tarefa`).
2. Desenvolva pequenas entregas (Atomic Commits).
3. Abra um PR apontando para a `main`.
4. É obrigatória a aprovação (Code Review) de pelo menos 1 membro da equipe antes do Merge.

### Padrão de Commits (Conventional Commits)
O histórico deve ser rastreável. Todo commit deve iniciar com um prefixo semântico:

- `feat:` Nova funcionalidade (ex: `feat: adiciona extrator de pdf`)
- `fix:` Correção de bug (ex: `fix: resolve conflito de permissao de volume`)
- `docs:` Documentação (ex: `docs: atualiza readme com arquitetura`)
- `refactor:` Alterações que não mudam comportamento (ex: `refactor: reorganiza imports da etl`)
- `chore:` Manutenção e infraestrutura (ex: `chore: atualiza imagem do airflow`)

### Integração Contínua (CI/CD)
O repositório utiliza GitHub Actions para garantir a integridade da main, barrando merges que quebrem a aplicação ou não passem pelos testes. O workflow de deploy da documentação está configurado em `.github/workflows/deploy-docs.yml`.