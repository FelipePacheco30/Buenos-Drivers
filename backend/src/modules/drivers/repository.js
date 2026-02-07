import { query } from '../../config/database.js';

class DriversRepository {
  async findByUserId(userId) {
    const { rows } = await query(
      'SELECT * FROM drivers WHERE user_id = $1',
      [userId]
    );
    return rows[0];
  }
}

export default new DriversRepository();
