import { pool } from '../../config/database.js';

class UsersRepository {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, status, password_hash FROM users WHERE email = $1',
      [email]
    );

    return rows[0];
  }
}

export default new UsersRepository();
