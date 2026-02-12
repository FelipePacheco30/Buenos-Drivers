import { query } from '../../config/database.js';

class VehiclesRepository {
  async create({ userId, plate, brand, kind, model, year, color }) {
    // compat: se o banco ainda não tiver coluna "kind", faz fallback sem ela
    try {
      const { rows } = await query(
        `
        INSERT INTO vehicles (user_id, plate, brand, kind, model, year, color)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [userId, plate, brand, kind, model, year, color]
      );
      return rows[0];
    } catch (e) {
      const code = e?.code;
      if (code !== '42703') throw e;
      const { rows } = await query(
        `
        INSERT INTO vehicles (user_id, plate, brand, model, year, color)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [userId, plate, brand, model, year, color]
      );
      return rows[0];
    }
  }

  async findByUserId(userId) {
    const { rows } = await query(
      `SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return rows;
  }
}

export default new VehiclesRepository();
