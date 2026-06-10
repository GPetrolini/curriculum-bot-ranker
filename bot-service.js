const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { initializeDatabase } = require('./database/database');
const { uploadRawResume } = require('./services/raw-resume-service');

let userDataPath = null;
let downloadsFolder = path.resolve(__dirname, 'pdf_downloads');
let dispatchLogFile = path.resolve(__dirname, 'dispatch_log.json');
let tokenFolderPath = path.resolve(__dirname, '.wwebjs_auth');

let botState = {
  client: null,
  isConnected: false,
};

function setUserDataPath(userPath) {
  userDataPath = userPath;
  downloadsFolder = path.join(userPath, 'pdf_downloads');
  dispatchLogFile = path.join(userPath, 'dispatch_log.json');
  tokenFolderPath = path.join(userPath, '.wwebjs_auth');
}

function ensureDownloadsFolder() {
  fs.mkdirSync(downloadsFolder, { recursive: true });
}

function ensureTokenFolder() {
  fs.mkdirSync(tokenFolderPath, { recursive: true });
}

function emit(sendEvent, type, payload) {
  if (typeof sendEvent === 'function') {
    sendEvent({ type, payload });
  } else if (type === 'log') {
    console.log(payload);
  }
}

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

  client.on('authenticated', () => {
    emit(sendEvent, 'log', 'Bot autenticado com sucesso!');
  });

  client.on('auth_failure', (msg) => {
    emit(sendEvent, 'error', `Falha na autenticação: ${msg}`);
  });

  client.on('message', async (message) => {
    if (!message.fromMe) {
      await processDocumentMessage(message, sendEvent);
    }
  });

  client.on('disconnected', (reason) => {
    emit(sendEvent, 'log', `Bot desconectado: ${reason}`);
    botState.isConnected = false;
  });

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

    // Usar o nome original do arquivo se disponível
    const originalName = filename.trim();
    const safeName = originalName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const fileName = safeName && safeName.toLowerCase().endsWith('.pdf') ? safeName : getPdfFileNameWwebjs(message);
    const filePath = path.join(downloadsFolder, fileName);

    emit(sendEvent, 'log', `PDF encontrado: ${originalName}`);

    if (fs.existsSync(filePath)) {
      emit(sendEvent, 'log', `PDF já existe, pulando: ${fileName}`);
      return false;
    }

    emit(sendEvent, 'log', `Baixando PDF: ${originalName}...`);

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
      // Se for base64
      buffer = Buffer.from(media, 'base64');
    } else if (media.data) {
      // Se for objeto MessageMedia
      buffer = Buffer.from(media.data, 'base64');
    } else {
      emit(sendEvent, 'error', `Formato de mídia desconhecido`);
      return false;
    }

    if (!buffer || buffer.length === 0) {
      emit(sendEvent, 'error', `Falha ao converter mídia para buffer`);
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

function getPdfFileNameWwebjs(message) {
  const originalName = message.filename || message.caption || '';
  const safeName = originalName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
  if (safeName && safeName.toLowerCase().endsWith('.pdf')) {
    return safeName;
  }

  const timestamp = message.timestamp || Date.now();
  const fromId = message.from ? message.from.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
  return `whatsapp_${fromId}_${timestamp}.pdf`;
}

function savePdfMetadataWwebjs(message, filePath) {
  const metadata = {
    from: message.from || null,
    senderName: message.author || message.notifyName || null,
    timestamp: message.timestamp || null,
    mimeType: message.mimetype || null,
    fileName: message.filename || null,
    savedPath: filePath,
    messageId: message.id?.id || null,
  };

  fs.appendFileSync(path.resolve(__dirname, 'pdf_metadata.log'), JSON.stringify(metadata) + '\n');
}

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

function getChatId(chat) {
  if (!chat) return null;
  if (typeof chat === 'string') return chat;
  if (chat.id) {
    if (typeof chat.id === 'string') return chat.id;
    return chat.id._serialized || chat.id.serialized || null;
  }
  return null;
}

function getChatTimestamp(chat) {
  if (!chat) return 0;
  return (
    chat.t ||
    chat.timestamp ||
    chat.lastMessage?.t ||
    chat.lastMessage?.timestamp ||
    chat.lastMessage?.time ||
    0
  );
}

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
    // Obter conversas usando whatsapp-web.js
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
        // Obter mensagens do chat
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

function getDownloadsFolder() {
  ensureDownloadsFolder();
  return downloadsFolder;
}

async function dispatchSelectedPdfs(fileNames, apiUrl) {
  if (!Array.isArray(fileNames) || fileNames.length === 0) {
    return { success: false, message: 'Nenhum PDF selecionado.' };
  }

  const validFiles = fileNames
    .map((name) => ({ name, path: path.join(downloadsFolder, name) }))
    .filter((item) => fs.existsSync(item.path));

  if (validFiles.length === 0) {
    return { success: false, message: 'Nenhum arquivo válido encontrado na pasta de downloads.' };
  }

  const dispatch = {
    timestamp: new Date().toISOString(),
    files: validFiles.map((item) => ({ name: item.name, path: item.path })),
  };

  fs.writeFileSync(dispatchLogFile, JSON.stringify(dispatch, null, 2));

  if (!apiUrl) {
    return {
      success: true,
      message: 'Dispatch salvo em dispatch_log.json. Configure apiUrl para envio automático.',
    };
  }

  if (!/^https?:\/\//.test(apiUrl)) {
    return { success: false, message: 'API URL inválida. Use http:// ou https://.' };
  }

  const payload = {
    timestamp: new Date().toISOString(),
    files: validFiles.map((item) => ({
      filename: item.name,
      contentBase64: fs.readFileSync(item.path).toString('base64'),
    })),
  };

  try {
    const response = await httpPost(apiUrl, payload);
    return response;
  } catch (error) {
    return {
      success: false,
      message: error?.message || error || 'Erro ao chamar API',
    };
  }
}

function httpPost(urlString, payload) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      const body = JSON.stringify(payload);
      const lib = url.protocol === 'https:' ? https : http;
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = lib.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          resolve({ success: true, status: res.statusCode, message: responseData || 'OK' });
        });
      });

      req.on('error', (err) => {
        reject({ success: false, message: err.message });
      });

      req.write(body);
      req.end();
    } catch (error) {
      reject({ success: false, message: error.message });
    }
  });
}

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

module.exports = {
  startBot,
  getPdfList,
  dispatchSelectedPdfs,
  getDownloadsFolder,
  scanRecentChats,
  uploadToDatabase,
  normalizeText,
  isCurriculoFileName,
};
