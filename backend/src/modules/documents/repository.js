import { query } from '../../config/database.js';

class DocumentsRepository {
  async upsert({ driverId, vehicleId, type, issuedAt, expiresAt, status }) {
    
    if (type === 'CRLV') {
      const { rows } = await query(
        `
        INSERT INTO documents (driver_id, vehicle_id, type, issued_at, expires_at, status)
        VALUES ($1, $2, 'CRLV', $3, $4, $5)
        ON CONFLICT (vehicle_id)
          WHERE type = 'CRLV' AND vehicle_id IS NOT NULL
        DO UPDATE SET
          issued_at = EXCLUDED.issued_at,
          expires_at = EXCLUDED.expires_at,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *
        `,
        [driverId, vehicleId, issuedAt, expiresAt, status]
      );
      return rows[0];
    }

    
    if (type === 'CNH') {
      const { rows } = await query(
        `
        INSERT INTO documents (driver_id, vehicle_id, type, issued_at, expires_at, status)
        VALUES ($1, NULL, 'CNH', $2, $3, $4)
        ON CONFLICT (driver_id)
          WHERE type = 'CNH' AND vehicle_id IS NULL
        DO UPDATE SET
          issued_at = EXCLUDED.issued_at,
          expires_at = EXCLUDED.expires_at,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *
        `,
        [driverId, issuedAt, expiresAt, status]
      );
      return rows[0];
    }

    
    const { rows } = await query(
      `
      INSERT INTO documents (driver_id, vehicle_id, type, issued_at, expires_at, status)
      VALUES ($1, NULL, 'CRIMINAL_RECORD', $2, $3, $4)
      ON CONFLICT (driver_id)
        WHERE type = 'CRIMINAL_RECORD' AND vehicle_id IS NULL
      DO UPDATE SET
        issued_at = EXCLUDED.issued_at,
        expires_at = EXCLUDED.expires_at,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *
      `,
      [driverId, issuedAt, expiresAt, status]
    );
    return rows[0];
  }

  async findByDriverId(driverId) {
    const { rows } = await query(
      `
      SELECT
        d.*,
        v.plate AS vehicle_plate,
        v.model AS vehicle_model
      FROM documents d
      LEFT JOIN vehicles v ON v.id = d.vehicle_id
      WHERE d.driver_id = $1
      ORDER BY d.type ASC, v.plate ASC NULLS LAST
      `,
      [driverId]
    );

    return rows;
  }
}

export default new DocumentsRepository();
