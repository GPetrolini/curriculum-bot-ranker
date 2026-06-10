const { query } = require('./database');
const { randomUUID } = require('crypto');

class RawResumeRepository {
  static async getByFileName(client, fileName) {
    const result = await client.query(
      'SELECT * FROM raw_resumes WHERE file_name = $1',
      [fileName]
    );
    return result.rows[0] || null;
  }

  static async getAll(client) {
    const result = await client.query('SELECT * FROM raw_resumes ORDER BY created_at DESC');
    return result.rows;
  }

  static async createRawResume(client, fileName, fileContent, status = 'pending') {
    const id = randomUUID();
    const result = await client.query(
      'INSERT INTO raw_resumes (id, file_name, file_content, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, fileName, fileContent, status]
    );
    return result.rows[0];
  }

  static async deleteById(client, resumeId) {
    const result = await client.query(
      'DELETE FROM raw_resumes WHERE id = $1 RETURNING *',
      [resumeId]
    );
    return result.rows[0] || null;
  }

  static async getById(client, resumeId) {
    const result = await client.query(
      'SELECT * FROM raw_resumes WHERE id = $1',
      [resumeId]
    );
    return result.rows[0] || null;
  }
}

module.exports = RawResumeRepository;
