# 📄 CV Ranker - AI Resume Analyzer

Projeto desenvolvido para a UC HUB: Projeto Prático.

## 🎯 Escopo do Projeto

O CV Ranker é uma ferramenta automatizada de leitura, estruturação e ranqueamento de currículos.  
O objetivo é acelerar o processo de triagem em processos seletivos, reduzindo o tempo de leitura humana e padronizando a avaliação dos candidatos.

Usuário-Alvo: Profissionais de Recursos Humanos (RH), recrutadores de tecnologia e Tech Recruiters.

---

## ⚙️ Arquitetura Inicial

O sistema será composto por um pipeline simples:

1. **Ingestão**
   - Leitura de arquivos PDF e DOCX

2. **Processamento (IA)**
   - Extração de informações estruturadas (nome, skills, experiência)
   - Geração de score de aderência à vaga

3. **Armazenamento**
   - Persistência dos dados estruturados para consultas

4. **Ranking**
   - Ordenação dos candidatos com base no score

---

## 🔀 Gestão de Configuração

Para garantir organização, colaboração segura e rastreabilidade das mudanças, o grupo adotou o modelo **GitHub Flow**.

### 🌿 Branches

- `main` → branch principal, sempre estável e com código validado
- `feature/nome-da-tarefa` → desenvolvimento de novas funcionalidades
- `fix/nome-do-bug` → correção de erros
- `docs/nome-da-alteracao` → alterações de documentação
- `chore/nome-da-tarefa` → tarefas de manutenção/configuração

---

### 🔄 Fluxo de Trabalho

1. Criar uma branch a partir da `main`
2. Desenvolver a funcionalidade nessa branch
3. Fazer commits pequenos, frequentes e padronizados
4. Abrir um Pull Request (PR)
5. Outro integrante revisa e comenta
6. Após aprovação, realizar o merge na `main`

---

## 📝 Política de Commits

O grupo adotou o padrão **Conventional Commits**.

### Tipos de commit

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `test:` testes
- `refactor:` refatoração sem alterar comportamento
- `chore:` manutenção/configuração
- `ci:` integração contínua

### Exemplos

- `feat: add PDF resume extraction`
- `fix: handle invalid file type`
- `docs: add configuration management section`
- `test: add basic CI validation test`
- `ci: configure GitHub Actions pipeline`
- `chore: update gitignore`

---

## 🧹 Boas Práticas

- Não realizar commits diretamente na `main`
- Sempre utilizar Pull Requests
- Realizar revisão de código antes do merge
- Fazer commits pequenos e frequentes
- Remover código morto e arquivos desnecessários
- Manter o `.gitignore` atualizado

---

## ✅ Integração Contínua (CI/CD)

O projeto utiliza **GitHub Actions** para:

- Executar testes automaticamente
- Validar alterações em Pull Requests
- Garantir que o código esteja sempre estável

---

## 🚀 Próximos Passos

- Implementar extração de texto (PDF/DOCX)
- Integrar com API de IA (Gemini)
- Criar sistema de score de candidatos
- Implementar armazenamento (banco de dados)