import { pool } from '../../config/database.js';

class UsersRepository {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0];
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, status, city, reputation_score FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  async listAdmins() {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, status, city, reputation_score
       FROM users
       WHERE role = 'ADMIN'
       ORDER BY created_at ASC`
    );
    return rows;
  }

  async updateStatus(userId, status) {
    const { rows } = await pool.query(
      `
      UPDATE users
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, role, status, city, reputation_score
      `,
      [userId, status]
    );
    return rows[0];
  }
}

export default new UsersRepository();
