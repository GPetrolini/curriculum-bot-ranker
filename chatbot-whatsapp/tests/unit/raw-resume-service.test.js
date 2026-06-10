const { uploadRawResume, getAllRawResumes, deleteRawResume, getRawResumeById } = require('../../services/raw-resume-service');
const { getClient } = require('../../database/database');
const RawResumeRepository = require('../../database/raw-resume-repository');

// Mock dos módulos
jest.mock('../../database/database');
jest.mock('../../database/raw-resume-repository');

describe('Raw Resume Service', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    getClient.mockResolvedValue(mockClient);
  });

  describe('uploadRawResume', () => {
    it('deve fazer upload de um raw resume com sucesso', async () => {
      const mockResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
        file_content: Buffer.from('content'),
        status: 'pending',
      };

      RawResumeRepository.getByFileName.mockResolvedValue(null);
      RawResumeRepository.createRawResume.mockResolvedValue(mockResume);

      const result = await uploadRawResume('curriculo.pdf', Buffer.from('content'), 'pending');

      expect(getClient).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(RawResumeRepository.getByFileName).toHaveBeenCalledWith(mockClient, 'curriculo.pdf');
      expect(RawResumeRepository.createRawResume).toHaveBeenCalledWith(
        mockClient,
        'curriculo.pdf',
        Buffer.from('content'),
        'pending'
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockResume);
    });

    it('deve lançar erro se já existe um arquivo com o mesmo nome', async () => {
      const existingResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
      };

      RawResumeRepository.getByFileName.mockResolvedValue(existingResume);

      await expect(
        uploadRawResume('curriculo.pdf', Buffer.from('content'), 'pending')
      ).rejects.toThrow("Já existe um PDF com o nome 'curriculo.pdf' no banco");

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('deve lançar erro e fazer rollback se a criação falhar', async () => {
      const error = new Error('Database error');
      RawResumeRepository.getByFileName.mockResolvedValue(null);
      RawResumeRepository.createRawResume.mockRejectedValue(error);

      await expect(
        uploadRawResume('curriculo.pdf', Buffer.from('content'), 'pending')
      ).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getAllRawResumes', () => {
    it('deve retornar todos os raw resumes', async () => {
      const mockResumes = [
        { id: '1', file_name: 'curriculo1.pdf' },
        { id: '2', file_name: 'curriculo2.pdf' },
      ];

      RawResumeRepository.getAll.mockResolvedValue(mockResumes);

      const result = await getAllRawResumes();

      expect(getClient).toHaveBeenCalled();
      expect(RawResumeRepository.getAll).toHaveBeenCalledWith(mockClient);
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockResumes);
    });
  });

  describe('deleteRawResume', () => {
    it('deve deletar um raw resume com sucesso', async () => {
      const mockDeletedResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
      };

      RawResumeRepository.deleteById.mockResolvedValue(mockDeletedResume);

      const result = await deleteRawResume('123e4567-e89b-12d3-a456-426614174000');

      expect(getClient).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(RawResumeRepository.deleteById).toHaveBeenCalledWith(
        mockClient,
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockDeletedResume);
    });

    it('deve lançar erro e fazer rollback se a deleção falhar', async () => {
      const error = new Error('Delete failed');
      RawResumeRepository.deleteById.mockRejectedValue(error);

      await expect(deleteRawResume('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow(
        'Delete failed'
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getRawResumeById', () => {
    it('deve retornar um raw resume pelo id', async () => {
      const mockResume = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'curriculo.pdf',
        file_content: Buffer.from('content'),
      };

      RawResumeRepository.getById.mockResolvedValue(mockResume);

      const result = await getRawResumeById('123e4567-e89b-12d3-a456-426614174000');

      expect(getClient).toHaveBeenCalled();
      expect(RawResumeRepository.getById).toHaveBeenCalledWith(
        mockClient,
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockResume);
    });
  });
});
