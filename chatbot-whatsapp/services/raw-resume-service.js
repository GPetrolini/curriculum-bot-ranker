const { getClient } = require('../database/database');
const RawResumeRepository = require('../database/raw-resume-repository');

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

async function getAllRawResumes() {
  const client = await getClient();
  try {
    return await RawResumeRepository.getAll(client);
  } finally {
    client.release();
  }
}

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

async function getRawResumeById(resumeId) {
  const client = await getClient();
  try {
    return await RawResumeRepository.getById(client, resumeId);
  } finally {
    client.release();
  }
}

module.exports = {
  uploadRawResume,
  getAllRawResumes,
  deleteRawResume,
  getRawResumeById,
};
