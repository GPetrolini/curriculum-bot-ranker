# Backend / Banco de Dados

Esta seção descreve a infraestrutura de banco de dados, a conexão PostgreSQL e o repositório de raw_resumes usado pelo bot.

## Conexão com PostgreSQL

`database/database.js` configura a conexão com PostgreSQL usando a biblioteca `pg`.

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});
```

### Inicialização do Banco

A função `initializeDatabase()` cria a tabela `raw_resumes` se ela não existir:

```javascript
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS raw_resumes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name VARCHAR(255) NOT NULL,
        file_content BYTEA NOT NULL,
        status VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela raw_resumes verificada/criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela raw_resumes:', error);
    throw error;
  } finally {
    client.release();
  }
}
```

### Função de Query

A função `query()` executa queries SQL com logging de performance:

```javascript
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

---

## Repositório de Raw Resumes

`database/raw-resume-repository.js` define a classe `RawResumeRepository` com métodos CRUD para a tabela `raw_resumes`.

### Obter por Nome do Arquivo

```javascript
static async getByFileName(client, fileName) {
  const result = await client.query(
    'SELECT * FROM raw_resumes WHERE file_name = $1',
    [fileName]
  );
  return result.rows[0] || null;
}
```

### Obter Todos

```javascript
static async getAll(client) {
  const result = await client.query('SELECT * FROM raw_resumes ORDER BY created_at DESC');
  return result.rows;
}
```

### Criar Raw Resume

```javascript
static async createRawResume(client, fileName, fileContent, status = 'pending') {
  const id = randomUUID();
  const result = await client.query(
    'INSERT INTO raw_resumes (id, file_name, file_content, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, fileName, fileContent, status]
  );
  return result.rows[0];
}
```

### Deletar por ID

```javascript
static async deleteById(client, resumeId) {
  const result = await client.query(
    'DELETE FROM raw_resumes WHERE id = $1 RETURNING *',
    [resumeId]
  );
  return result.rows[0] || null;
}
```

### Obter por ID

```javascript
static async getById(client, resumeId) {
  const result = await client.query(
    'SELECT * FROM raw_resumes WHERE id = $1',
    [resumeId]
  );
  return result.rows[0] || null;
}
```

---

## Serviço de Raw Resume

`services/raw-resume-service.js` orquestra as operações de upload e consulta de raw_resumes com transações.

### Upload de Raw Resume

```javascript
async function uploadRawResume(fileName, fileContent, status = 'pending') {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    const existing = await RawResumeRepository.getByFileName(client, fileName);
    if (existing) {
      throw new Error(`Já existe um PDF com o nome '${fileName}' no banco`);
    }

    const rawResume = await RawResumeRepository.createRawResume(
      client,
      fileName,
      fileContent,
      status
    );
    
    await client.query('COMMIT');
    return rawResume;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### Obter Todos os Raw Resumes

```javascript
async function getAllRawResumes() {
  const client = await getClient();
  try {
    return await RawResumeRepository.getAll(client);
  } finally {
    client.release();
  }
}
```

### Deletar Raw Resume

```javascript
async function deleteRawResume(resumeId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const deleted = await RawResumeRepository.deleteById(client, resumeId);
    await client.query('COMMIT');
    return deleted;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### Obter Raw Resume por ID

```javascript
async function getRawResumeById(resumeId) {
  const client = await getClient();
  try {
    return await RawResumeRepository.getById(client, resumeId);
  } finally {
    client.release();
  }
}
```

---

## Fluxo de Upload para Banco de Dados

```mermaid
sequenceDiagram
    participant UI as Interface Electron
    participant Bot as Bot Service
    participant Service as Raw Resume Service
    participant Repo as Raw Resume Repository
    participant DB as PostgreSQL

    UI->>Bot: uploadToDatabase(fileNames)
    Bot->>Service: uploadRawResume(fileName, fileContent)
    Service->>DB: BEGIN TRANSACTION
    Service->>Repo: getByFileName(fileName)
    Repo-->>Service: Retorna existing ou null
    alt Já existe
        Service->>DB: ROLLBACK
        Service-->>Bot: Erro: arquivo já existe
    else Não existe
        Service->>Repo: createRawResume(fileName, fileContent)
        Repo->>DB: INSERT INTO raw_resumes
        DB-->>Repo: Retorna raw_resume criado
        Repo-->>Service: Retorna raw_resume
        Service->>DB: COMMIT
        Service-->>Bot: Retorna raw_resume
    end
    Bot-->>UI: Retorna resultado do upload
```

---

## Configuração

- A variável `DATABASE_URL` deve ser definida no arquivo `.env`
- Exemplo: `DATABASE_URL=postgresql://user:password@host:port/database`
- Se a URL incluir `sslmode=require`, o SSL será configurado automaticamente
- A tabela `raw_resumes` é criada automaticamente na primeira execução
