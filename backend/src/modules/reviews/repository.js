import { query } from '../../config/database.js';

class ReviewsRepository {
  async listNegativeByDriverId(driverId, limit = 10) {
    const lim = Number(limit) || 10;
    const { rows } = await query(
      `
      SELECT *
      FROM negative_reviews
      WHERE driver_id = $1
      ORDER BY created_at DESC
      LIMIT ${lim}
      `,
      [driverId]
    );
    return rows;
  }

  async deleteNegativeById(id) {
    const { rows } = await query(
      `
      DELETE FROM negative_reviews
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );
    return rows[0] || null;
  }
}

export default new ReviewsRepository();

