import { query } from '../../config/database.js';

class DriversRepository {
  async findByUserId(userId) {
    const { rows } = await query(
      'SELECT * FROM drivers WHERE user_id = $1',
      [userId]
    );
    return rows[0];
  }

  async listForAdmin() {
    const { rows } = await query(
      `
      SELECT
        dr.id AS driver_id,
        dr.user_id,
        dr.total_trips,
        dr.total_deliveries,
        dr.daily_earnings,
        dr.is_active,
        dr.created_at AS driver_created_at,
        u.name,
        u.email,
        u.city,
        u.status AS user_status,
        u.reputation_score,
        (SELECT COUNT(*)::int FROM vehicles v WHERE v.user_id = u.id) AS vehicles_count,
        COALESCE(SUM(CASE WHEN d.status = 'VALID' THEN 1 ELSE 0 END), 0) AS docs_valid,
        COALESCE(SUM(CASE WHEN d.status = 'EXPIRING' THEN 1 ELSE 0 END), 0) AS docs_expiring,
        COALESCE(SUM(CASE WHEN d.status = 'EXPIRED' THEN 1 ELSE 0 END), 0) AS docs_expired,
        CASE
          WHEN u.status = 'BANNED' THEN 'EXPIRED'
          WHEN u.status = 'IRREGULAR' THEN 'EXPIRING'
          WHEN COALESCE(SUM(CASE WHEN d.status = 'EXPIRED' THEN 1 ELSE 0 END), 0) > 0 THEN 'EXPIRED'
          WHEN COALESCE(SUM(CASE WHEN d.status = 'EXPIRING' THEN 1 ELSE 0 END), 0) > 0 THEN 'EXPIRING'
          ELSE 'VALID'
        END AS documents_overall_status
      FROM drivers dr
      JOIN users u ON u.id = dr.user_id
      LEFT JOIN documents d ON d.driver_id = dr.id
      GROUP BY dr.id, u.id
      ORDER BY dr.created_at DESC
      `
    );

    return rows;
  }

  async getForAdminByDriverId(driverId) {
    const { rows } = await query(
      `
      SELECT
        dr.id AS driver_id,
        dr.user_id,
        dr.total_trips,
        dr.total_deliveries,
        dr.daily_earnings,
        dr.is_active,
        dr.created_at AS driver_created_at,
        u.name,
        u.email,
        u.city,
        u.status AS user_status,
        u.reputation_score
      FROM drivers dr
      JOIN users u ON u.id = dr.user_id
      WHERE dr.id = $1
      LIMIT 1
      `,
      [driverId]
    );

    return rows[0];
  }

  async incrementDailyEarnings(driverId, amount) {
    const { rows } = await query(
      `
      UPDATE drivers
      SET daily_earnings = COALESCE(daily_earnings, 0) + $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING daily_earnings
      `,
      [driverId, amount]
    );
    return rows[0]?.daily_earnings ?? null;
  }
}

export default new DriversRepository();
