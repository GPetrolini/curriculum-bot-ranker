# 📄 CV Ranker - AI Resume Analyzer

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Apache Airflow](https://img.shields.io/badge/Airflow-017CEE?style=for-the-badge&logo=Apache%20Airflow&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

> Ferramenta automatizada de leitura, estruturação e ranqueamento de currículos impulsionada por Inteligência Artificial.


> Este projeto está em fase ativa de desenvolvimento (Sprint atual). A infraestrutura base já está operante, mas as integrações de Inteligência Artificial e a interface final ainda estão sendo implementadas assim como o README.
## Sobre o Projeto
Projeto desenvolvido para a UC de **Gestão de Qualidade de Software** do curso de Análise e Desenvolvimento de Sistemas.

**Instituição:** UNISUL - Florianópolis, SC.

**Professor** Prof. Dr. Saulo Popov Zambiasi


**Equipe de Desenvolvimento:**
* **Gustavo Petrolini** (10724112917) - Engenharia de Dados / Banco de Dados
*  **Gustavo Perino** (1072412639) - Backend
*  **Leonardo Vivan** (1072416471) - Frontend
*  **Tiago Machado** (1072410017) - Frontend 
*  **Natã Batista** (1072415016) - Integração IA

---

## Escopo e Arquitetura

O **CV Ranker** visa acelerar o processo de triagem em processos seletivos, reduzindo o tempo de leitura humana e padronizando a avaliação dos candidatos de forma técnica.

**Pipeline de Dados:**
1. **Ingestão (Bronze):** Leitura de arquivos PDF/DOCX armazenados localmente e envio automatizado para o Data Lake (Google Cloud Storage).
2. **Processamento (Silver):** Extração de texto via Python e estruturação semântica (nome, skills, experiência) utilizando a API do Google Gemini.
3. **Armazenamento (Gold):** Persistência dos dados estruturados em banco relacional PostgreSQL para consumo da aplicação.
4. **Aplicação:** Interface e API para RH ranquear e visualizar o *match* dos candidatos com a vaga.

---

## Módulos do Monorepo

O repositório abriga todas as frentes do projeto. Cada desenvolvedor atua em seu respectivo escopo técnico:

### 1. Engenharia de Dados (Gustavo Petrolini)
* **Tecnologias:** Python, Apache Airflow, Docker, Google Cloud Storage, PostgreSQL.
* **Status Atual:**
  * Infraestrutura de orquestração local via Docker Compose (Webserver, Scheduler).
  * Criação do Pipeline de Ingestão (DAGs) conectando dados brutos locais ao Data Lake no GCP.
  * Injeção de credenciais de nuvem automatizada via variáveis de ambiente.

### 2. Backend & IA (Gustavo Perino)
* **Tecnologias:** Python, FastAPI, Google Gemini API, SQLAlchemy.
* **Status Atual:**
  * [Descrever o que já foi configurado,].

###  3. Frontend ([Nome])
* **Tecnologias:** [React / HTML / CSS / etc]
* **Status Atual:**
  * [Descrever o progresso].

---

##  Estrutura do Repositório

```text
📦 cv-ranker
 ┣ 📂 .github/workflows/  # Pipelines de CI/CD automatizados (GitHub Actions)
 ┣ 📂 alembic/            # Migrações e versionamento do banco de dados
 ┣ 📂 config/             # Arquivos de configuração global do projeto
 ┣ 📂 dags/               # Orquestração de pipelines de dados (Apache Airflow)
 ┣ 📂 docs/               # Documentação complementar do projeto
 ┣ 📂 etl/                # Scripts Python (Extração, Transformação e Carga)
 ┣ 📂 src/                # Código-fonte da aplicação (Backend API e lógicas core)
 ┣ 📂 terraform/          # Infraestrutura como Código (IaC) para o GCP
 ┣ 📂 tests/              # Testes unitários e de integração
 ┣ 📜 .env.example        # Template seguro de variáveis de ambiente
 ┣ 📜 docker-compose.yaml # Orquestração dos containers (Airflow, Postgres, etc.)
 ┣ 📜 init-db.sh          # Script de inicialização e seed do banco de dados
 ┣ 📜 requirements.txt    # Dependências de pacotes do Python
 ┗ 📜 README.md           # Documentação principal
 ```

# Como Executar Localmente
Pré-requisitos: ```Docker``` e ```Docker Compose```.

## 1. Clone o repositório:

```
git clone [https://github.com/SEU_USUARIO/cv-ranker.git](https://github.com/SEU_USUARIO/cv-ranker.git)
```
cd cv-ranker
## 2. Configuração de Variáveis:
Crie uma cópia do ```.env.example``` e renomeie para ```.env```.
```
cp .env.example .env
Preencha o .env com as credenciais do GCP e demais chaves da aplicação.
```
## 3. Suba a Infraestrutura:
```
docker compose up -d
```
Airflow UI: ```http://localhost:8080```

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