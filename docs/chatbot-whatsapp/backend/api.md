# Backend / Serviços

Esta página mostra os principais serviços do backend com os trechos reais do código.

## Bot Service

`bot-service.js` contém a lógica principal do bot, incluindo monitoramento de mensagens, download de PDFs e escaneamento de conversas.

### Inicialização do Bot

A função `startBot()` inicializa o cliente WhatsApp Web.js e configura os eventos:

```javascript
async function startBot(sendEvent, userDataPathParam) {
  if (userDataPathParam) {
    setUserDataPath(userDataPathParam);
  }

  ensureDownloadsFolder();
  ensureTokenFolder();
  emit(sendEvent, 'log', 'Iniciando WhatsApp Web.js...');

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'session1',
      dataPath: tokenFolderPath,
    }),
    puppeteer: {
      headless: false,
      args: ['--no-sandbox'],
    },
  });

  botState.client = client;

  client.on('qr', (qr) => {
    emit(sendEvent, 'qr', { base64: qr });
    emit(sendEvent, 'log', 'QR code gerado. Escaneie com o WhatsApp.');
  });

  client.on('ready', () => {
    emit(sendEvent, 'status', { status: 'connected', session: 'session1' });
    emit(sendEvent, 'log', 'Bot conectado ao WhatsApp!');
    botState.isConnected = true;
  });

  // ... outros eventos

  try {
    emit(sendEvent, 'log', 'Inicializando cliente...');
    await client.initialize();
    emit(sendEvent, 'log', 'Bot inicializado. Aguardando QR code ou sessão salva...');
    return client;
  } catch (err) {
    emit(sendEvent, 'error', `Falha ao iniciar bot: ${err}`);
    throw err;
  }
}
```

### Processamento de Mensagens

A função `processDocumentMessage()` processa mensagens do tipo documento e verifica se é um currículo:

```javascript
async function processDocumentMessage(message, sendEvent) {
  try {
    if (message.type !== 'document') {
      return false;
    }

    const mimetype = message.mimetype || '';
    const filename = message.filename || message.caption || message.body || '';

    // Verificar se é PDF pelo mimetype ou pelo nome do arquivo
    const isPdfByMimetype = mimetype.includes('pdf');
    const isPdfByFilename = filename.toLowerCase().endsWith('.pdf');

    if (!isPdfByMimetype && !isPdfByFilename) {
      return false;
    }

    // Filtro de nome - baixar apenas currículos
    if (!isCurriculoFileName(filename)) {
      emit(sendEvent, 'log', `PDF ignorado (não é currículo): ${filename}`);
      return false;
    }

    // Download da mídia usando whatsapp-web.js
    const media = await message.downloadMedia();

    if (!media) {
      emit(sendEvent, 'error', `Falha ao baixar mídia do documento`);
      return false;
    }

    // Extrair buffer do MessageMedia
    let buffer;
    if (Buffer.isBuffer(media)) {
      buffer = media;
    } else if (typeof media === 'string') {
      buffer = Buffer.from(media, 'base64');
    } else if (media.data) {
      buffer = Buffer.from(media.data, 'base64');
    } else {
      emit(sendEvent, 'error', `Formato de mídia desconhecido`);
      return false;
    }

    fs.writeFileSync(filePath, buffer);
    emit(sendEvent, 'log', `PDF salvo: ${fileName}`);
    emit(sendEvent, 'pdf-saved', { name: fileName, path: filePath });
    savePdfMetadataWwebjs(message, filePath);
    return true;
  } catch (err) {
    emit(sendEvent, 'error', `Erro ao processar documento: ${err}`);
    return false;
  }
}
```

### Escaneamento de Conversas

A função `scanRecentChats()` escaneia conversas históricas para encontrar PDFs de currículos:

```javascript
async function scanRecentChats(chatCount = 10, sendEvent) {
  ensureDownloadsFolder();

  if (!botState.client || !botState.isConnected) {
    emit(sendEvent, 'error', `Bot state inválido. isConnected=${botState.isConnected}, client=${!!botState.client}`);
    throw new Error('Bot não está conectado. Aguarde o login e tente novamente.');
  }

  const count = Number(chatCount) || 10;
  if (count <= 0) {
    throw new Error('Informe um número válido de conversas para varrer.');
  }

  emit(sendEvent, 'log', `Obtendo conversas recentes (até ${count})...`);

  try {
    const chats = await botState.client.getChats();
    if (!Array.isArray(chats)) {
      throw new Error(`Lista de conversas inválida. Tipo recebido: ${typeof chats}`);
    }

    const recentChats = chats.slice(0, count);
    emit(sendEvent, 'log', `Iniciando varredura nas últimas ${recentChats.length} conversas...`);

    let savedCount = 0;
    let scannedCount = 0;

    for (const chat of recentChats) {
      const title = chat.name || chat.id._serialized || 'Sem título';
      emit(sendEvent, 'log', `Escaneando conversa: ${title}`);

      try {
        const messages = await chat.fetchMessages({ limit: 50 });
        if (!Array.isArray(messages)) continue;

        for (const message of messages) {
          try {
            if (!message.fromMe) {
              if (await processDocumentMessage(message, sendEvent)) {
                savedCount += 1;
              }
              scannedCount += 1;
            }
          } catch (err) {
            emit(sendEvent, 'error', `Erro ao processar mensagem: ${err}`);
          }
        }
      } catch (err) {
        emit(sendEvent, 'error', `Erro ao carregar mensagens de ${title}: ${err}`);
      }
    }

    emit(sendEvent, 'log', `Varredura concluída. Mensagens verificadas: ${scannedCount}, currículos salvos: ${savedCount}.`);
    return {
      success: true,
      message: `Varredura concluída. Mensagens verificadas: ${scannedCount}, currículos salvos: ${savedCount}.`,
    };
  } catch (err) {
    emit(sendEvent, 'error', `Erro ao escanear conversas: ${err}`);
    throw err;
  }
}
```

### Upload para Banco de Dados

A função `uploadToDatabase()` envia PDFs para o banco de dados PostgreSQL:

```javascript
async function uploadToDatabase(fileNames) {
  try {
    await initializeDatabase();
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const fileName of fileNames) {
      try {
        const filePath = path.join(downloadsFolder, fileName);
        
        if (!fs.existsSync(filePath)) {
          errors.push(`${fileName}: arquivo não encontrado`);
          errorCount++;
          continue;
        }

        const fileContent = fs.readFileSync(filePath);
        await uploadRawResume(fileName, fileContent, 'pending');
        successCount++;
      } catch (error) {
        errors.push(`${fileName}: ${error.message}`);
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Upload concluído: ${successCount} arquivo(s) enviado(s), ${errorCount} erro(s)`,
      successCount,
      errorCount,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao inicializar banco de dados: ${error.message}`,
    };
  }
}
```

---

## Filtro de Currículos

A função `isCurriculoFileName()` normaliza o texto e verifica se contém palavras-chave relacionadas a currículos:

```javascript
function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function isCurriculoFileName(fileName) {
  const normalized = normalizeText(fileName);
  return (
    normalized.includes('curriculo') ||
    normalized.includes('currículo') ||
    normalized.includes('curriculum') ||
    /cv/.test(normalized)
  );
}
```

---

## Lista de PDFs

A função `getPdfList()` retorna a lista de PDFs baixados com metadados:

```javascript
function getPdfList() {
  ensureDownloadsFolder();
  const items = fs.readdirSync(downloadsFolder);
  return items
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .map((file) => {
      const filePath = path.join(downloadsFolder, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        filePath,
        size: stats.size,
        modifiedAt: stats.mtimeMs,
      };
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);
}
```
