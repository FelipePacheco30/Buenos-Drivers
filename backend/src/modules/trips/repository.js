import { query } from '../../config/database.js';

class TripsRepository {
  async createAccepted({ driverId, userId, type, origin, destination, price }) {
    const { rows } = await query(
      `
      INSERT INTO trips (user_id, driver_id, type, status, origin, destination, price)
      VALUES ($1, $2, $3, 'ACCEPTED', $4, $5, $6)
      RETURNING *
      `,
      [userId, driverId, type, origin, destination, price]
    );
    return rows[0];
  }

  async complete(tripId) {
    const { rows } = await query(
      `
      UPDATE trips
      SET status = 'COMPLETED',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [tripId]
    );
    return rows[0];
  }

  async findById(tripId) {
    const { rows } = await query(`SELECT * FROM trips WHERE id = $1 LIMIT 1`, [tripId]);
    return rows[0] || null;
  }

  async findByDriver(driverId) {
    const { rows } = await query(
      `SELECT * FROM trips
       WHERE driver_id = $1
       ORDER BY created_at DESC`,
      [driverId]
    );
    return rows;
  }
}

export default new TripsRepository();
