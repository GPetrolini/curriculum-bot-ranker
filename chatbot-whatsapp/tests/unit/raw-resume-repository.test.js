const RawResumeRepository = require('../../database/raw-resume-repository');
const { query } = require('../../database/database');

// Mock do database
jest.mock('../../database/database', () => ({
  query: jest.fn(),
}));

describe('RawResumeRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByFileName', () => {
    it('deve retornar o raw resume quando encontrado pelo nome do arquivo', async () => {
      const mockResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
        file_content: Buffer.from('test'),
        status: 'pending',
        created_at: new Date(),
      };

      query.mockResolvedValue({ rows: [mockResume] });

      const client = { query };
      const result = await RawResumeRepository.getByFileName(client, 'curriculo.pdf');

      expect(result).toEqual(mockResume);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM raw_resumes WHERE file_name = $1',
        ['curriculo.pdf']
      );
    });

    it('deve retornar null quando não encontrado', async () => {
      query.mockResolvedValue({ rows: [] });

      const client = { query };
      const result = await RawResumeRepository.getByFileName(client, 'nao_existe.pdf');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os raw resumes ordenados por created_at', async () => {
      const mockResumes = [
        { id: '1', file_name: 'curriculo1.pdf', created_at: new Date('2024-01-02') },
        { id: '2', file_name: 'curriculo2.pdf', created_at: new Date('2024-01-01') },
      ];

      query.mockResolvedValue({ rows: mockResumes });

      const client = { query };
      const result = await RawResumeRepository.getAll(client);

      expect(result).toEqual(mockResumes);
      expect(query).toHaveBeenCalledWith('SELECT * FROM raw_resumes ORDER BY created_at DESC');
    });
  });

  describe('createRawResume', () => {
    it('deve criar um novo raw resume com sucesso', async () => {
      const mockNewResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'novo_curriculo.pdf',
        file_content: Buffer.from('content'),
        status: 'pending',
        created_at: new Date(),
      };

      query.mockResolvedValue({ rows: [mockNewResume] });

      const client = { query };
      const result = await RawResumeRepository.createRawResume(
        client,
        'novo_curriculo.pdf',
        Buffer.from('content'),
        'pending'
      );

      expect(result).toEqual(mockNewResume);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO raw_resumes (id, file_name, file_content, status) VALUES ($1, $2, $3, $4) RETURNING *',
        expect.any(Array)
      );
    });
  });

  describe('deleteById', () => {
    it('deve deletar um raw resume pelo id', async () => {
      const mockDeletedResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
      };

      query.mockResolvedValue({ rows: [mockDeletedResume] });

      const client = { query };
      const result = await RawResumeRepository.deleteById(client, '123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockDeletedResume);
      expect(query).toHaveBeenCalledWith(
        'DELETE FROM raw_resumes WHERE id = $1 RETURNING *',
        ['123e4567-e89b-12d3-a456-426614174000']
      );
    });

    it('deve retornar null quando o id não existe', async () => {
      query.mockResolvedValue({ rows: [] });

      const client = { query };
      const result = await RawResumeRepository.deleteById(client, 'nao_existe');

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('deve retornar o raw resume quando encontrado pelo id', async () => {
      const mockResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
        file_content: Buffer.from('test'),
        status: 'pending',
      };

      query.mockResolvedValue({ rows: [mockResume] });

      const client = { query };
      const result = await RawResumeRepository.getById(client, '123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockResume);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM raw_resumes WHERE id = $1',
        ['123e4567-e89b-12d3-a456-426614174000']
      );
    });

    it('deve retornar null quando não encontrado', async () => {
      query.mockResolvedValue({ rows: [] });

      const client = { query };
      const result = await RawResumeRepository.getById(client, 'nao_existe');

      expect(result).toBeNull();
    });
  });
});
