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
}

export default new UsersRepository();
