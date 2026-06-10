# WhatsApp PDF Scanner - Bot de Download de Currículos

> Documentação técnica do bot de WhatsApp para download automático de currículos.

## Seções principais

- `Backend` — serviços, integração com WhatsApp e banco de dados.
- `Frontend` — interface Electron para gerenciamento do bot.
- `Testes` — testes unitários e BDD.

## Como navegar

Use a barra lateral para abrir cada área. Cada página contém:
- explicação em texto
- função/arquivo real do código
- trechos de código relevantes

---

## Visão geral do sistema

O sistema é composto por um bot de WhatsApp que monitora automaticamente as conversas e baixa PDFs que contenham "curriculo", "currículo", "curriculum" ou "cv" no nome do arquivo. Os PDFs são salvos localmente e podem ser enviados para o banco de dados para processamento pela API do curriculum-bot-ranker.

### Funcionalidades principais

- **Download automático de PDFs em tempo real**: Monitora mensagens do WhatsApp e baixa PDFs automaticamente
- **Escaneamento manual de conversas antigas**: Permite escanear conversas históricas para encontrar currículos
- **Interface Electron**: Interface desktop para visualização e gerenciamento do bot
- **Filtro inteligente**: Identifica currículos pelo nome do arquivo
- **Persistência de sessão**: Não precisa escanear QR code sempre
- **Upload para banco de dados**: Envia PDFs para o PostgreSQL para processamento

---

## Estrutura do projeto

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

## Tecnologias

- **Node.js**: Runtime JavaScript
- **Electron**: Interface desktop
- **whatsapp-web.js**: Integração com WhatsApp Web
- **PostgreSQL (pg)**: Banco de dados para persistência de PDFs
- **Jest**: Framework de testes unitários
- **Cucumber**: Framework de testes BDD

---

## Observações técnicas

- **Dependências críticas**: `whatsapp-web.js`, `electron`, `pg`, `dotenv`
- **Arquivo de configuração**: `.env` (variáveis esperadas):
  - `DATABASE_URL` (ex: postgresql://...)
- **Entradas de runtime importantes**: pasta `pdf_downloads/` contém PDFs baixados
- **Sessão do WhatsApp**: A sessão é salva em `.wwebjs_auth/` para evitar escanear QR code sempre

Pontos de atenção:
- O filtro de currículos usa normalização de texto para remover acentos e caixa alta/baixa
- O bot usa `whatsapp-web.js` com autenticação local para persistência de sessão
- O upload para o banco de dados usa transações para garantir consistência
- A interface Electron usa IPC (Inter-Process Communication) para comunicação entre processo principal e renderer

---

## Resumo executivo

O sistema monitora automaticamente as conversas do WhatsApp e baixa PDFs que contenham palavras-chave relacionadas a currículos. Os PDFs são salvos localmente e podem ser enviados para o banco de dados PostgreSQL para processamento pela API do curriculum-bot-ranker. A interface Electron permite gerenciar o bot, visualizar logs, escanear conversas antigas e fazer upload de PDFs para o banco de dados.
