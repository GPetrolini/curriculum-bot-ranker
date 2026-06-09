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

 **Status:** *Este projeto está em fase ativa de desenvolvimento. A infraestrutura de dados, modelagem do banco e orquestração de IA já estão operantes. As integrações finais entre microserviços e a interface (Frontend) estão em andamento.*

---

## Sobre o Projeto
Projeto desenvolvido para a Unidade Curricular de **Gestão de Qualidade de Software** do curso de Análise e Desenvolvimento de Sistemas.

* **Instituição:** UNISUL - Florianópolis, SC.
* **Professor:** Prof. Dr. Saulo Popov Zambiasi

**Equipe de Desenvolvimento:**
* **Gustavo Petrolini** (10724112917) - Engenharia de Dados / Cloud / Banco de Dados
* **Gustavo Perino** (1072412639) - Backend & IA
* **Leonardo Vivan** (1072416471) - Frontend
* **Tiago Machado** (1072410017) - Frontend 
* **Natã Batista** (1072415016) - Integração IA / Pipeline BDD

---

## Escopo e Arquitetura

O **CV Ranker** visa acelerar o processo de triagem em processos seletivos, reduzindo drasticamente o tempo de leitura humana e padronizando a avaliação dos candidatos de forma técnica e imparcial.

### O Fluxo de Dados e Processamento:
1. **Ingestão:** O currículo (PDF) chega através do bot e é armazenado de forma segura, acionando a API.
2. **Extração & Score:** O Backend extrai o texto do PDF e o analisa através de um motor de pontuação (Score), buscando as habilidades obrigatórias (`must_have`) e desejáveis (`nice_to_have`).
3. **Análise Semântica (IA):** Integração com **OpenAI** para leitura humana avançada, gerando um resumo profissional e definindo a senioridade do candidato.
4. **Armazenamento:** Persistência dos dados estruturados e notas em um banco **PostgreSQL (Neon)**.
5. **Analytics:** O **Apache Airflow** extrai os dados processados e realiza a carga (ELT) no Data Lake/Data Warehouse (**Google Cloud Platform**) para geração de dashboards e métricas do RH.

---

## Algoritmo de Ranqueamento

O motor de *ranking* avalia a compatibilidade do candidato com a vaga seguindo esta régua de notas (Score):

* **80+ pontos** ➔ `EXCELENTE`
* **50 a 79 pontos** ➔ `BOM`
* **30 a 49 pontos** ➔ `MEDIANO`
* **0 a 29 pontos** ➔ `FRACO`

---

## Módulos do Monorepo

O repositório abriga todas as frentes do projeto. Cada desenvolvedor atua em seu respectivo escopo técnico:

### 1. Engenharia de Dados (Gustavo Petrolini)
* **Tecnologias:** Python, Apache Airflow, Docker, Google Cloud Storage, PostgreSQL.
* **Status Atual:**
  * Infraestrutura de orquestração local via Docker Compose (Webserver, Scheduler).
  * Criação do Pipeline de Ingestão (DAGs) conectando dados brutos locais ao Data Lake no GCP.
  * Injeção de credenciais de nuvem automatizada via variáveis de ambiente.

### 2. Backend & IA (Gustavo Perino / Natã Batista)
* **Tecnologias:** Python, FastAPI, OpenAI / Google Gemini, SQLAlchemy, Docker.
* **Status Atual:**
  * API FastAPI implementada com rotas de análise e consulta de candidatos.
  * Integração com OpenAI para gerar resumo de currículo, seniority e skills a partir do texto armazenado no banco.
  * Serviço Docker dedicado `backend` disponível em `docker-compose.yaml`.
  * Suporte a variáveis de ambiente via `.env` para `DATABASE_URL`, `OPENAI_API_KEY` e demais credenciais.

### 3. Frontend (Leonardo Vivan & Tiago Machado)
* **Tecnologias:** HTML5, CSS3, Vanilla JavaScript.
* **Status Atual:**
  * Estrutura base da interface criada (HTML).
  * Estilização em progresso via CSS.
  * Lógica de consumo da API (Javascript) em fase de integração.

---

## Como Executar Localmente

### Pré-requisitos
* `Docker` e `Docker Compose` instalados.
* Uma conta no GCP (Google Cloud) e chaves de API (OpenAI/Gemini).

### 1. Clonar o Repositório
```
git clone [https://github.com/GPetrolini/curriculum-bot-ranker.git](https://github.com/GPetrolini/curriculum-bot-ranker.git)
cd curriculum-bot-ranker
```

## 2. Configuração de Variáveis:
Crie uma cópia do `.env.example` e renomeie para `.env`.

```
cp .env.example .env
```

Preencha o `.env` com as credenciais do GCP e demais chaves da aplicação.

## 3. Suba a Infraestrutura:

```
docker compose up -d
```

Airflow UI: `http://localhost:8080`

## 4. Backend FastAPI via Docker
O backend FastAPI tem um container próprio. Em execução local via Docker/compose ele expõe a API em `http://localhost:8000` por padrão (quando executado isoladamente com o Dockerfile/backend ou mapeado para a porta 8000).

Para subir apenas o backend:

```bash
docker compose up -d backend
```

Para subir toda a stack (Postgres + backend + Airflow):

```bash
docker compose up -d
```

Para testar apenas o backend e reconstruir a imagem:

```bash
docker compose up --build backend
```

### Endpoints disponíveis
- `POST http://localhost:8000/resume/analyze`
  - Payload JSON:

```json
{
  "candidate_id": "93ce286a-954a-4510-8e35-95689376e716"
}
```
  - Executa análise de currículo usando o texto já armazenado no banco e atualiza os campos `ai_summary`, `ai_strengths`, `ai_seniority`.
- `POST http://localhost:8000/resume/analyze-missing`
  - Sem body. Varre o banco e gera resumos de IA apenas para candidatos cujo campo `ai_summary` esteja vazio (`null`).
  - Exemplos:

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/resume/analyze-missing -ContentType "application/json"
```

curl:

```bash
curl -X POST http://127.0.0.1:8000/resume/analyze-missing
```
- `GET http://localhost:8000/resume/info?candidate_id=<id>`
  - Exemplo:

```bash
curl "http://localhost:8000/resume/info?candidate_id=93ce286a-954a-4510-8e35-95689376e716"
```
  - Retorna o resumo, seniority e strengths do candidato já calculados.

# Testes
Este projeto usa `pytest` para testes automatizados e também inclui cenários no padrão BDD com `pytest-bdd`.

## O que está coberto
- Testes unitários em `tests/test_scoring_and_ranking.py`:
  - valida o cálculo de score em `scoring_service.calculate_score`
  - testa todos os intervalos de ranking em `RankingEngine.determine_ranking`
  - verifica a aplicação de ranking em payloads de candidato com `RankingEngine.apply`
- Testes BDD em `tests/features/scoring_and_ranking.feature` e `tests/test_scoring_and_ranking_bdd.py`:
  - descrevem o comportamento esperado em cenários Gherkin
  - confirmam o cálculo de score, a determinação de ranking e a aplicação do ranking no payload

## Como executar
Executar apenas os testes de score e ranking:
```powershell
.venv\Scripts\Activate.ps1
pytest -q tests/test_scoring_and_ranking.py
```

Executar todos os testes da pasta `tests`:
```powershell
.venv\Scripts\Activate.ps1
pytest -q tests
```

## Observações
- A suíte atual já roda com `pytest` e inclui testes unitários e BDD para a lógica de score/ranking.
- O foco de teste atual é a lógica de score e de determinação de ranking, não a extração de PDF ou a API inteira.
- O projeto também roda o script principal em CLI para exibir o ranking no terminal, além de persistir candidatos no banco.
- Se precisar de relatório de cobertura percentual, é possível adicionar `pytest-cov` ao projeto posteriormente.

# Guia de Contribuição e Versionamento
Este repositório segue práticas rigorosas de CI/CD e revisão de código.

### Fluxo de Trabalho (GitHub Flow)
A branch ```main``` é protegida. O desenvolvimento de novas features ocorre em branches isoladas e é integrado via Pull Request (PR).

1. Crie uma branch a partir da ```main``` (```feature/nome-da-tarefa```).

2. Desenvolva pequenas entregas (Atomic Commits).

3. Abra um PR apontando para a ```main```.

4. É obrigatória a aprovação (Code Review) de pelo menos 1 membro da equipe antes do Merge.

### Padrão de Commits (Conventional Commits)
O histórico deve ser rastreável. Todo commit deve iniciar com um prefixo semântico:

```feat:``` Nova funcionalidade (```feat: adiciona extrator de pdf```)

```fix```: Correção de bug (```fix: resolve conflito de permissao de volume```)

```docs```: Documentação (```docs: atualiza readme com arquitetura```)

```refactor```: Alterações que não mudam comportamento (```refactor: reorganiza imports da etl```)

```chore```: Manutenção e infraestrutura (```chore: atualiza imagem do airflow```)


# Integração Contínua (CI/CD)
O repositório utiliza GitHub Actions (ou similar configurado) para garantir a integridade da main, barrando merges que quebrem a aplicação ou não passem pelos testes.