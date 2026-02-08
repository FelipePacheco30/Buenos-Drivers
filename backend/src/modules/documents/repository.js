import { query } from '../../config/database.js';

class DocumentsRepository {
  async create({ userId, type, url, status }) {
    const { rows } = await query(
      `
      INSERT INTO documents (user_id, type, url, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [userId, type, url, status || 'PENDING']
    );

    return rows[0];
  }

  async findByUserId(userId) {
    const { rows } = await query(
      `SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return rows;
  }
}

export default new DocumentsRepository();
