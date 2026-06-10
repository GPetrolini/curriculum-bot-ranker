const venom = require("venom-bot");
const fs = require("fs");
const path = require("path");

venom.create({
  session: "session1",
  multidevice: true,
  headless: false,
  useChrome: true,
  browserArgs: ["--no-sandbox"],
  folderNameToken: 'tokens',
})
  .then((client) => {
    log("Sessão criada. Aguardando conexão real...");
    esperarClientPronto(client);
    
    // Encerra quando fechar o bot (Ctrl+C)
    process.on('SIGINT', async () => {
      log("Bot encerrado manualmente.");
      process.exit();
    });
    
  })
  .catch((erro) => {
    logErro("Erro ao iniciar o Venom: " + erro);
  });

async function esperarClientPronto(client) {
  let tentativas = 0;
  const maxTentativas = 10;

  while (tentativas < maxTentativas) {
    const state = await client.getConnectionState();
    log(`Estado da conexão (${tentativas + 1}/${maxTentativas}): ${state}`);

    if (state === "CONNECTED") {
      log("Bot conectado e pronto para uso!");
      listenForPdfUploads(client);
      return;
    }

    tentativas++;
    await new Promise((res) => setTimeout(res, 3000));
  }

  logErro("Não foi possível conectar completamente após várias tentativas.");
}


function log(msg) {
  console.log(msg);
  fs.appendFileSync('log.txt', msg + "\n");
}

function logErro(msg) {
  console.error(msg);
  fs.appendFileSync('erros.txt', msg + "\n");
}


async function listenForPdfUploads(client) {
  const downloadsFolder = path.resolve(__dirname, 'pdf_downloads');
  fs.mkdirSync(downloadsFolder, { recursive: true });

  await client.onAnyMessage(async (message) => {
    try {
      if (message.fromMe) return;
      if (message.type !== 'document') return;

      const mimetype = (message.mimetype || '').toLowerCase();
      const filename = (message.filename || message.fileName || '').toLowerCase();
      if (!mimetype.includes('pdf') && !filename.endsWith('.pdf')) return;

      const base64Data = await client.downloadMedia(message);
      if (!base64Data) {
        logErro(`Falha ao baixar mídia do documento recebido de ${message.from}`);
        return;
      }

      const rawBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const fileName = getPdfFileName(message);
      const filePath = path.join(downloadsFolder, fileName);

      fs.writeFileSync(filePath, Buffer.from(rawBase64, 'base64'));
      log(`PDF salvo: ${filePath} (de ${message.from})`);
      savePdfMetadata(message, filePath);

      await client.sendText(message.from, 'PDF recebido e salvo com sucesso. Obrigado!');
    } catch (err) {
      logErro(`Erro ao processar PDF recebido: ${err}`);
    }
  });
}

function getPdfFileName(message) {
  const originalName = message.filename || message.fileName || message.caption || '';
  const safeName = originalName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
  if (safeName && safeName.toLowerCase().endsWith('.pdf')) {
    return safeName;
  }

  const timestamp = message.t || message.timestamp || Date.now();
  const fromId = message.from ? message.from.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
  return `whatsapp_${fromId}_${timestamp}.pdf`;
}

function savePdfMetadata(message, filePath) {
  const metadata = {
    from: message.from,
    senderName: message.senderName || message.notifyName || null,
    timestamp: message.t || message.timestamp || null,
    mimeType: message.mimetype || null,
    fileName: message.filename || message.fileName || null,
    savedPath: filePath,
    messageId: typeof message.id === 'string' ? message.id : message.id?._serialized || null,
  };

  fs.appendFileSync('pdf_metadata.log', JSON.stringify(metadata) + '\n');
}
