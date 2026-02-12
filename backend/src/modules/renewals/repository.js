import { query } from '../../config/database.js';

class RenewalsRepository {
  async createRenewal({ driverId, userId }) {
    const { rows } = await query(
      `
      INSERT INTO renewals (driver_id, user_id, status)
      VALUES ($1, $2, 'PENDING')
      RETURNING *
      `,
      [driverId, userId]
    );
    return rows[0];
  }

  async addRenewalDocument({ renewalId, type, vehicleId, issuedAt, expiresAt }) {
    const { rows } = await query(
      `
      INSERT INTO renewal_documents (renewal_id, type, vehicle_id, issued_at, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [renewalId, type, vehicleId || null, issuedAt, expiresAt]
    );
    return rows[0];
  }

  async addVehicleAdd({ renewalId, plate, brand, kind, model, year, color, crlvIssuedAt, crlvExpiresAt }) {
    // compat: se o banco ainda não tiver coluna "kind", faz fallback sem ela
    try {
      const { rows } = await query(
        `
        INSERT INTO renewal_vehicle_add
          (renewal_id, plate, brand, kind, model, year, color, crlv_issued_at, crlv_expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `,
        [renewalId, plate, brand, kind, model, year, color, crlvIssuedAt, crlvExpiresAt]
      );
      return rows[0];
    } catch (e) {
      const code = e?.code;
      // 42703: undefined_column
      if (code !== '42703') throw e;
      const { rows } = await query(
        `
        INSERT INTO renewal_vehicle_add
          (renewal_id, plate, brand, model, year, color, crlv_issued_at, crlv_expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [renewalId, plate, brand, model, year, color, crlvIssuedAt, crlvExpiresAt]
      );
      return rows[0];
    }
  }

  async listForAdmin() {
    const { rows } = await query(
      `
      SELECT
        r.id,
        r.driver_id,
        r.user_id,
        r.status,
        r.created_at,
        u.name,
        u.email,
        u.status AS user_status
      FROM renewals r
      JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC
      `
    );
    return rows;
  }

  async getById(id) {
    const { rows } = await query(
      `
      SELECT
        r.id,
        r.driver_id,
        r.user_id,
        r.status,
        r.created_at,
        u.name,
        u.email,
        u.status AS user_status
      FROM renewals r
      JOIN users u ON u.id = r.user_id
      WHERE r.id = $1
      LIMIT 1
      `,
      [id]
    );
    return rows[0];
  }

  async listDocumentsByRenewalId(renewalId) {
    const { rows } = await query(
      `
      SELECT
        rd.*,
        v.plate AS vehicle_plate,
        v.model AS vehicle_model
      FROM renewal_documents rd
      LEFT JOIN vehicles v ON v.id = rd.vehicle_id
      WHERE rd.renewal_id = $1
      ORDER BY rd.type ASC, v.plate ASC NULLS LAST
      `,
      [renewalId]
    );
    return rows;
  }

  async getVehicleAddByRenewalId(renewalId) {
    const { rows } = await query(
      `
      SELECT *
      FROM renewal_vehicle_add
      WHERE renewal_id = $1
      LIMIT 1
      `,
      [renewalId]
    );
    return rows[0] || null;
  }

  async setStatus(id, status) {
    const { rows } = await query(
      `
      UPDATE renewals
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id, status]
    );
    return rows[0];
  }

  async deleteOlderThanDays(days) {
    const d = Number(days);
    const { rowCount } = await query(
      `
      DELETE FROM renewals
      WHERE created_at < NOW() - ($1::int * INTERVAL '1 day')
      `,
      [d]
    );
    return rowCount || 0;
  }
}

export default new RenewalsRepository();

