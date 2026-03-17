# 📄 CV Ranker - AI Resume Analyzer

> Projeto desenvolvido para a UC HUB: Projeto Prático.

## 🎯 Escopo do Projeto
O **CV Ranker** é uma ferramenta automatizada de leitura, estruturação e ranqueamento de currículos. O objetivo é acelerar o processo de triagem em processos seletivos, reduzindo o tempo de leitura humana e padronizando a avaliação dos candidatos.

**Usuário-Alvo:** Profissionais de Recursos Humanos (RH), Recrutadores de Tech e Tech Recruiters que lidam com alto volume de candidaturas.

## ⚙️ Como Funciona (Arquitetura Inicial)
O software opera como um pipeline de dados simples:
1. **Ingestão:** Leitura de arquivos PDF/Docx.
2. **Processamento (IA):** Integração com a API do Google Gemini para extrair entidades estruturadas (Nome, Skills, Experiência) e gerar um *score* de aderência à vaga.
3. **Armazenamento:** Salvamento dos dados estruturados em banco de dados para consultas rápidas.

## 🛠️ Tecnologias Planejadas
* **Linguagem:** Python 3.10+
* **IA/LLM:** Google Gemini API
* **Banco de Dados:** SQLite / PostgreSQL
* **Qualidade e Testes:** `pytest` (Testes automatizados), `flake8` (Linting)
* **CI/CD:** GitHub Actions (Planejado para Sprints futuras)

## 👥 Equipe
* Gustavo Petrolini 10724112917 - Engenharia de Dados / Backend
* Gustavo Perino 1072412639 - [Papel]
* Leonardo Vivan 1072416471 - [Papel]
* Tiago Machado 1072410017- [Papel]
* Natã Batista 1072415016 - [Papel]

---
*Status: Sprint 1 - Planejamento e Estruturação do Repositório.*