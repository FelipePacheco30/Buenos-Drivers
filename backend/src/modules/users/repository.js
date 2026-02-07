import { query } from '../../config/database.js';

class UsersRepository {
  async findByEmail(email) {
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0];
  }

  async findById(id) {
    const { rows } = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  async updateStatus(id, status) {
    await query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
  }
}

export default new UsersRepository();
