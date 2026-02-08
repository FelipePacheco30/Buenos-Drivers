import { query } from '../../config/database.js';

class TripsRepository {
  async create(data) {
    const {
      driver_id,
      user_id,
      type,
      amount,
      platform_fee,
      driver_amount,
      status,
    } = data;

    const { rows } = await query(
      `INSERT INTO trips
       (driver_id, user_id, type, amount, platform_fee, driver_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        driver_id,
        user_id,
        type,
        amount,
        platform_fee,
        driver_amount,
        status,
      ]
    );

    return rows[0];
  }

  async complete(tripId) {
    await query(
      `UPDATE trips
       SET status = 'COMPLETED', completed_at = NOW()
       WHERE id = $1`,
      [tripId]
    );
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
