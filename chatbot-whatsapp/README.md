# WhatsApp PDF Scanner - Bot de Download de Currículos

## Como configurar

Instale o Node.js.

Baixe todos os arquivos do projeto.

- `rodar_bot.bat` → para rodar com dois cliques.

### Configuração inicial

No terminal da pasta do bot, rode:

```bash
npm install
```

## Como usar o BOT de download de currículos

O bot monitora automaticamente as conversas do WhatsApp e baixa PDFs que contenham "curriculo", "currículo", "curriculum" ou "cv" no nome do arquivo.

### Funcionalidades

- Download automático de PDFs em tempo real
- Escaneamento manual de conversas antigas
- Interface Electron para visualização e gerenciamento
- Filtro inteligente para identificar currículos
- Persistência de sessão (não precisa escanear QR code sempre)

## Como executar

### Método 1: Pelo atalho .bat

Basta dar dois cliques no arquivo `rodar_bot.bat`.

Ele abrirá o aplicativo Electron automaticamente.

Escaneie o QR code na primeira vez.

O bot ficará conectado e baixará PDFs automaticamente quando forem enviados.

### Método 2: Pelo terminal

Na pasta do bot, rode:

```bash
npm start
```

Escaneie o QR code na primeira vez.

O bot ficará conectado e baixará PDFs automaticamente quando forem enviados.

## Interface do Bot

A interface Electron possui:

- Status da conexão
- QR code para autenticação
- Logs em tempo real
- Lista de PDFs baixados
- Botão para escanear conversas antigas
- Botão para abrir pasta de downloads
- Opção para enviar PDFs para API (futuro)

## Filtro de Currículos

O bot baixa apenas PDFs que contenham no nome:
- "curriculo" (com ou sem acento)
- "currículo" (com acento)
- "curriculum"
- "cv" (como palavra separada)

### Exemplos de arquivos que serão baixados

- "Curriculo ANA CLARA.pdf" ✅
- "Currículo João Silva.pdf" ✅
- "Curriculum Maria Santos.pdf" ✅
- "CV Pedro Costa.pdf" ✅

### Exemplos de arquivos que serão ignorados

- "Trabalho.pdf" ❌
- "Conta_de_agua.pdf" ❌
- "Apresentação.pdf" ❌

## Como encerrar o bot

Feche a janela do aplicativo Electron.

A sessão será salva automaticamente, então na próxima vez não será necessário escanear o QR code novamente.

## Arquivos e Pastas

- `pdf_downloads/` → Pasta onde os PDFs são salvos
- `pdf_metadata.log` → Log com metadados dos PDFs baixados
- `.wwebjs_auth/` → Sessão do WhatsApp (não excluir)
- `bot-service.js` → Lógica principal do bot
- `main.js` → Processo principal do Electron
- `index.html` → Interface do usuário
- `renderer.js` → Lógica da interface
- `preload.js` → Ponte entre processo principal e renderer

## Tecnologias

- Node.js
- Electron (interface desktop)
- whatsapp-web.js (integração com WhatsApp)
