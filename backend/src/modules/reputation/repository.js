import { query } from '../../config/database.js';

class ReputationRepository {
  async findByTarget(userId) {
    const { rows } = await query(
      'SELECT * FROM reputations WHERE target_user_id = $1',
      [userId]
    );
    return rows;
  }
}

export default new ReputationRepository();
