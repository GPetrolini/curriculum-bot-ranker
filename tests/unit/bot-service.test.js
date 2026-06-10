const fs = require('fs');
const path = require('path');
const {
  getPdfList,
  uploadToDatabase,
  isCurriculoFileName,
  normalizeText,
} = require('../../bot-service');

// Mock dos módulos
jest.mock('fs');
jest.mock('path');
jest.mock('../../database/database');
jest.mock('../../services/raw-resume-service');

// Mock do whatsapp-web.js para evitar carregar puppeteer
jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn(),
  LocalAuth: jest.fn(),
}));

describe('Bot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar mocks padrão
    path.resolve.mockImplementation((dir, file) => `${dir}/${file}`);
    path.join.mockImplementation((dir, file) => `${dir}/${file}`);
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(Buffer.from('test content'));
  });

  describe('normalizeText', () => {
    it('deve remover acentos e converter para minúsculas', () => {
      expect(normalizeText('Currículo')).toBe('curriculo');
      expect(normalizeText('CAVALO')).toBe('cavalo');
      expect(normalizeText('ÁÉÍÓÚ')).toBe('aeiou');
      expect(normalizeText('çÇ')).toBe('cc');
    });

    it('deve manter caracteres sem acento', () => {
      expect(normalizeText('curriculo')).toBe('curriculo');
      expect(normalizeText('CV')).toBe('cv');
    });
  });

  describe('isCurriculoFileName', () => {
    it('deve identificar arquivos com "curriculo" no nome', () => {
      expect(isCurriculoFileName('curriculo.pdf')).toBe(true);
      expect(isCurriculoFileName('meu_curriculo.pdf')).toBe(true);
      expect(isCurriculoFileName('Curriculo.pdf')).toBe(true);
    });

    it('deve identificar arquivos com "currículo" (com acento)', () => {
      expect(isCurriculoFileName('currículo.pdf')).toBe(true);
      expect(isCurriculoFileName('meu_currículo.pdf')).toBe(true);
    });

    it('deve identificar arquivos com "curriculum"', () => {
      expect(isCurriculoFileName('curriculum.pdf')).toBe(true);
      expect(isCurriculoFileName('my_curriculum.pdf')).toBe(true);
    });

    it('deve identificar arquivos com "cv" no nome', () => {
      expect(isCurriculoFileName('cv.pdf')).toBe(true);
      expect(isCurriculoFileName('meu_cv.pdf')).toBe(true);
      expect(isCurriculoFileName('CV.pdf')).toBe(true);
      expect(isCurriculoFileName('cv_backend_pleno.pdf')).toBe(true);
    });

    it('deve rejeitar arquivos sem palavras-chave', () => {
      expect(isCurriculoFileName('documento.pdf')).toBe(false);
      expect(isCurriculoFileName('arquivo.pdf')).toBe(false);
      expect(isCurriculoFileName('relatorio.pdf')).toBe(false);
    });
  });

  describe('getPdfList', () => {
    it('deve retornar lista de PDFs da pasta de downloads', () => {
      const mockFiles = ['curriculo1.pdf', 'curriculo2.pdf', 'outro.pdf'];
      const mockStats = { size: 1024, mtimeMs: Date.now() };

      fs.readdirSync.mockReturnValue(mockFiles);
      fs.statSync.mockReturnValue(mockStats);

      const result = getPdfList();

      expect(fs.readdirSync).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('curriculo1.pdf');
      expect(result[0].size).toBe(1024);
    });

    it('deve retornar array vazio se não houver arquivos', () => {
      fs.readdirSync.mockReturnValue([]);

      const result = getPdfList();

      expect(result).toEqual([]);
    });

    it('deve ordenar por data de modificação (mais recente primeiro)', () => {
      const mockFiles = ['curriculo1.pdf', 'curriculo2.pdf'];
      const mockStats1 = { size: 1024, mtimeMs: 1000 };
      const mockStats2 = { size: 2048, mtimeMs: 2000 };

      fs.readdirSync.mockReturnValue(mockFiles);
      fs.statSync
        .mockReturnValueOnce(mockStats1)
        .mockReturnValueOnce(mockStats2);

      const result = getPdfList();

      expect(result[0].name).toBe('curriculo2.pdf');
      expect(result[1].name).toBe('curriculo1.pdf');
    });
  });

  describe('uploadToDatabase', () => {
    const { initializeDatabase } = require('../../database/database');
    const { uploadRawResume } = require('../../services/raw-resume-service');

    beforeEach(() => {
      initializeDatabase.mockResolvedValue();
      uploadRawResume.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
      });
    });

    it('deve fazer upload de múltiplos arquivos com sucesso', async () => {
      const fileNames = ['curriculo1.pdf', 'curriculo2.pdf'];

      const result = await uploadToDatabase(fileNames);

      expect(initializeDatabase).toHaveBeenCalled();
      expect(uploadRawResume).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
    });

    it('deve lançar erro se arquivo não existir', async () => {
      fs.existsSync.mockReturnValue(false);
      const fileNames = ['nao_existe.pdf'];

      const result = await uploadToDatabase(fileNames);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toContain('nao_existe.pdf: arquivo não encontrado');
    });

    it('deve continuar processando mesmo se um arquivo falhar', async () => {
      uploadRawResume.mockRejectedValueOnce(new Error('Upload failed'));
      const fileNames = ['curriculo1.pdf', 'curriculo2.pdf'];

      const result = await uploadToDatabase(fileNames);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('deve lançar erro se inicialização do banco falhar', async () => {
      initializeDatabase.mockRejectedValue(new Error('Database init failed'));
      const fileNames = ['curriculo.pdf'];

      const result = await uploadToDatabase(fileNames);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erro ao inicializar banco de dados');
    });

    it('deve lançar erro se já existe arquivo com mesmo nome', async () => {
      uploadRawResume.mockRejectedValue(
        new Error("Já existe um PDF com o nome 'curriculo.pdf' no banco")
      );
      const fileNames = ['curriculo.pdf'];

      const result = await uploadToDatabase(fileNames);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0]).toContain("Já existe um PDF com o nome 'curriculo.pdf' no banco");
    });
  });
});
