const statusLabel = document.getElementById('statusLabel');
const logContainer = document.getElementById('logContainer');
const pdfListBody = document.getElementById('pdfListBody');
const refreshButton = document.getElementById('refreshButton');
const scanChatsButton = document.getElementById('scanChatsButton');
const scanCountInput = document.getElementById('scanCountInput');
const openFolderButton = document.getElementById('openFolderButton');
const uploadToDbButton = document.getElementById('uploadToDbButton');

function appendLog(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logContainer.prepend(line);
}

function setStatus(status) {
  if (!status) return;
  if (typeof status === 'object') {
    statusLabel.textContent = status.status ? `${status.status}` : JSON.stringify(status);
  } else {
    statusLabel.textContent = String(status);
  }
}

async function refreshPdfList() {
  try {
    const files = await window.electronApi.getPdfList();
    pdfListBody.innerHTML = '';

    if (!files.length) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4" class="empty">Nenhum PDF encontrado.</td>';
      pdfListBody.appendChild(row);
      return;
    }

    files.forEach((file, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="checkbox" name="pdf-checkbox" value="${file.name}" id="pdf_${index}" /></td>
        <td><label for="pdf_${index}">${file.name}</label></td>
        <td>${(file.size / 1024).toFixed(1)} KB</td>
        <td>${new Date(file.modifiedAt).toLocaleString()}</td>
      `;
      pdfListBody.appendChild(row);
    });
  } catch (err) {
    appendLog(`Erro ao atualizar lista de PDFs: ${err.message || err}`, 'error');
  }
}

function handleBotEvent(event) {
  switch (event.type) {
    case 'status':
      setStatus(event.payload);
      appendLog(`Status: ${event.payload.status || JSON.stringify(event.payload)}`);
      break;
    case 'log':
      appendLog(event.payload);
      break;
    case 'pdf-saved':
      appendLog(`PDF recebido: ${event.payload.name}`);
      refreshPdfList();
      break;
    case 'error':
      appendLog(`Erro: ${event.payload}`, 'error');
      break;
    default:
      appendLog(`Evento desconhecido: ${event.type}`);
  }
}

function getSelectedFiles() {
  return Array.from(document.querySelectorAll('input[name="pdf-checkbox"]:checked')).map((input) => input.value);
}

refreshButton.addEventListener('click', () => refreshPdfList());
scanChatsButton.addEventListener('click', async () => {
  const count = Number(scanCountInput.value);
  if (!count || count <= 0) {
    appendLog('Informe um número válido de conversas para escanear.', 'warn');
    return;
  }

  appendLog(`Iniciando varredura das últimas ${count} conversas...`);
  const result = await window.electronApi.scanRecentChats(count);
  if (result.success) {
    appendLog(result.message);
    refreshPdfList();
  } else {
    appendLog(`Falha na varredura: ${result.message}`, 'error');
  }
});
openFolderButton.addEventListener('click', () => window.electronApi.openPdfFolder());
uploadToDbButton.addEventListener('click', async () => {
  const selectedFiles = getSelectedFiles();
  if (!selectedFiles.length) {
    appendLog('Selecione pelo menos um PDF antes de fazer upload.', 'warn');
    return;
  }

  appendLog(`Iniciando upload de ${selectedFiles.length} arquivo(s) para o banco de dados...`);
  const result = await window.electronApi.uploadToDatabase(selectedFiles);

  if (result.success) {
    appendLog(result.message);
    if (result.errors && result.errors.length > 0) {
      result.errors.forEach((error) => appendLog(`Erro: ${error}`, 'error'));
    }
  } else {
    appendLog(`Falha no upload: ${result.message}`, 'error');
  }
});

window.electronApi.onBotEvent(handleBotEvent);
refreshPdfList();
