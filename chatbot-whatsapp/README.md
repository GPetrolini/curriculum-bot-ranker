# WhatsApp PDF Scanner - Bot de Download de Currículos

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

> Bot de WhatsApp para download automático de currículos em PDF com interface Electron desktop.

**Status:** *Este projeto está em fase ativa de desenvolvimento. O bot monitora conversas do WhatsApp e baixa PDFs automaticamente, com interface para gerenciamento e integração com banco de dados.*

---

## Sobre o Projeto

Projeto desenvolvido como parte do **CV Ranker** - sistema de análise e ranqueamento de currículos.

### Desenvolvedor

* **Natã Batista** - Backend & Integração IA / Pipeline BDD

---

## Escopo e Arquitetura

O **WhatsApp PDF Scanner** automatiza o processo de coleta de currículos via WhatsApp, integrando-se ao sistema de análise do CV Ranker.

### Funcionalidades Principais

1. **Download Automático:** Monitora conversas do WhatsApp em tempo real e baixa PDFs automaticamente.
2. **Filtro Inteligente:** Identifica currículos pelo nome do arquivo (curriculo, currículo, curriculum, cv).
3. **Interface Electron:** Interface desktop para visualização e gerenciamento do bot.
4. **Persistência de Sessão:** Não precisa escanear QR code sempre.
5. **Escaneamento Manual:** Permite escanear conversas históricas para encontrar currículos.
6. **Integração com Banco de Dados:** Envia PDFs para PostgreSQL para processamento pela API.

### Filtro de Currículos

O bot baixa apenas PDFs que contenham no nome:
- "curriculo" (com ou sem acento)
- "currículo" (com acento)
- "curriculum"
- "cv" (como palavra separada)

**Exemplos de arquivos que serão baixados:**
- "Curriculo ANA CLARA.pdf" ✅
- "Currículo João Silva.pdf" ✅
- "Curriculum Maria Santos.pdf" ✅
- "CV Pedro Costa.pdf" ✅

**Exemplos de arquivos que serão ignorados:**
- "Trabalho.pdf" ❌
- "Conta_de_agua.pdf" ❌
- "Apresentação.pdf" ❌

---

## Estrutura do Projeto

```
├── bot-service.js          # Lógica principal do bot
├── bot.js                  # Implementação alternativa com venom-bot
├── main.js                 # Processo principal do Electron
├── index.html              # Interface do usuário
├── renderer.js             # Lógica da interface
├── preload.js              # Ponte entre processo principal e renderer
├── style.css               # Estilos da interface
├── database/
│   ├── database.js         # Conexão com PostgreSQL
│   └── raw-resume-repository.js  # Repositório de raw_resumes
├── services/
│   └── raw-resume-service.js     # Serviço de upload de PDFs
├── tests/
│   ├── features/           # Testes BDD (Cucumber)
│   └── unit/               # Testes unitários (Jest)
├── pdf_downloads/          # Pasta onde os PDFs são salvos
├── pdf_metadata.log        # Log com metadados dos PDFs baixados
└── .wwebjs_auth/           # Sessão do WhatsApp (não excluir)
```

---

## Como Executar

### Pré-requisitos
* Node.js instalado
* npm (Node Package Manager)

### 1. Clonar o Repositório

```bash
git clone https://github.com/GPetrolini/curriculum-bot-ranker.git
cd curriculum-bot-ranker/chatbot-whatsapp
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie uma cópia do `.env.example` e renomeie para `.env`:

```bash
cp .env.example .env
```

Preencha o `.env` com as credenciais do banco de dados:
- `DATABASE_URL` - URL de conexão com PostgreSQL

### 4. Executar o Bot

**Método 1: Pelo atalho .bat**

Basta dar dois cliques no arquivo `rodar_bot.bat`.

**Método 2: Pelo terminal**

```bash
npm start
```

Escaneie o QR code na primeira vez. O bot ficará conectado e baixará PDFs automaticamente quando forem enviados.

### 5. Encerrar o Bot

Feche a janela do aplicativo Electron. A sessão será salva automaticamente, então na próxima vez não será necessário escanear o QR code novamente.

---

## Testes

Este projeto usa `Jest` para testes unitários e `Cucumber` para testes BDD.

### O que está coberto
- **Testes unitários** em `tests/unit/`:
  - `bot-service.test.js` - Testa funções do bot-service.js
  - `database.test.js` - Testa conexão e operações do banco
  - `raw-resume-repository.test.js` - Testa repositório de raw_resumes
  - `raw-resume-service.test.js` - Testa serviço de raw_resumes
- **Testes BDD** em `tests/features/`:
  - `bot-service.feature` - Cenários para o serviço do bot
  - `database.feature` - Cenários para o banco de dados
  - `raw-resume.feature` - Cenários para o serviço de raw_resumes

### Como executar
Executar todos os testes:
```bash
npm test
```

Executar testes em modo watch:
```bash
npm run test:watch
```

Executar testes com coverage:
```bash
npm run test:coverage
```

---

## Tecnologias

- **Node.js** - Runtime JavaScript
- **Electron** - Interface desktop
- **whatsapp-web.js** - Integração com WhatsApp Web
- **PostgreSQL (pg)** - Banco de dados para persistência de PDFs
- **Jest** - Framework de testes unitários
- **Cucumber** - Framework de testes BDD

---

## Observações Técnicas

- **Dependências críticas:** `whatsapp-web.js`, `electron`, `pg`, `dotenv`
- **Arquivo de configuração:** `.env` (variáveis esperadas):
  - `DATABASE_URL` (ex: postgresql://...)
- **Entradas de runtime importantes:** pasta `pdf_downloads/` contém PDFs baixados
- **Sessão do WhatsApp:** A sessão é salva em `.wwebjs_auth/` para evitar escanear QR code sempre

Pontos de atenção:
- O filtro de currículos usa normalização de texto para remover acentos e caixa alta/baixa
- O bot usa `whatsapp-web.js` com autenticação local para persistência de sessão
- O upload para o banco de dados usa transações para garantir consistência
- A interface Electron usa IPC (Inter-Process Communication) para comunicação entre processo principal e renderer

---

## Documentação

Para mais informações técnicas sobre o bot, consulte a documentação em `docs/chatbot-whatsapp/` do repositório principal.
