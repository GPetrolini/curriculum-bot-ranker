const { Pool } = require('pg');
const { pool, initializeDatabase, query, getClient } = require('../../database/database');

// Mock do dotenv para evitar carregar variáveis de ambiente reais
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock do pg Pool
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };

  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mockPool),
  };
});

// Mock do console para evitar logs durante testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('Database Module', () => {
  let mockPool;
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool = new Pool();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValue(mockClient);
  });

  describe('initializeDatabase', () => {
    it('deve criar a tabela raw_resumes se não existir', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      await initializeDatabase();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS raw_resumes')
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('deve lançar erro se a criação da tabela falhar', async () => {
      const error = new Error('Database connection failed');
      mockClient.query.mockRejectedValue(error);

      await expect(initializeDatabase()).rejects.toThrow('Database connection failed');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('query', () => {
    it('deve executar query com sucesso', async () => {
      const mockResult = { rows: [{ id: 1, name: 'test' }] };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await query('SELECT * FROM test', []);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', []);
    });

    it('deve lançar erro se a query falhar', async () => {
      const error = new Error('Query failed');
      mockPool.query.mockRejectedValue(error);

      await expect(query('SELECT * FROM test', [])).rejects.toThrow('Query failed');
    });
  });

  describe('getClient', () => {
    it('deve retornar um cliente do pool', async () => {
      const client = await getClient();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(client).toEqual(mockClient);
    });
  });
});
