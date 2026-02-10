import { query } from '../../config/database.js';

class DocumentsRepository {
  async upsert({ driverId, type, issuedAt, expiresAt, status }) {
    const { rows } = await query(
      `
      INSERT INTO documents (driver_id, type, issued_at, expires_at, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (driver_id, type)
      DO UPDATE SET
        issued_at = EXCLUDED.issued_at,
        expires_at = EXCLUDED.expires_at,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *
      `,
      [driverId, type, issuedAt, expiresAt, status]
    );

    return rows[0];
  }

  async findByDriverId(driverId) {
    const { rows } = await query(
      `SELECT * FROM documents WHERE driver_id = $1 ORDER BY type ASC`,
      [driverId]
    );

    return rows;
  }
}

export default new DocumentsRepository();
