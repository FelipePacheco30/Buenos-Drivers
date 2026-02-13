import { query } from '../../config/database.js';

class MessagesRepository {
  async listConversationsForAdmin() {
    const { rows } = await query(
      `
      WITH last_message AS (
        SELECT DISTINCT ON (m.driver_id)
          m.driver_id,
          m.sender_role,
          m.system_event,
          m.body,
          m.created_at
        FROM messages m
        ORDER BY m.driver_id, m.created_at DESC
      )
      SELECT
        dr.id AS driver_id,
        u.id AS user_id,
        u.name,
        u.email,
        u.city,
        u.status AS user_status,
        u.reputation_score,
        COALESCE(SUM(CASE WHEN d.status = 'VALID' THEN 1 ELSE 0 END), 0) AS docs_valid,
        COALESCE(SUM(CASE WHEN d.status = 'EXPIRING' THEN 1 ELSE 0 END), 0) AS docs_expiring,
        COALESCE(SUM(CASE WHEN d.status = 'EXPIRED' THEN 1 ELSE 0 END), 0) AS docs_expired,
        CASE
          WHEN u.status = 'BANNED' THEN 'EXPIRED'
          WHEN u.status = 'IRREGULAR' THEN 'EXPIRING'
          WHEN COALESCE(SUM(CASE WHEN d.status = 'EXPIRED' THEN 1 ELSE 0 END), 0) > 0 THEN 'EXPIRED'
          WHEN COALESCE(SUM(CASE WHEN d.status = 'EXPIRING' THEN 1 ELSE 0 END), 0) > 0 THEN 'EXPIRING'
          ELSE 'VALID'
        END AS documents_overall_status,
        lm.body AS last_message,
        lm.sender_role AS last_sender_role,
        lm.system_event AS last_system_event,
        lm.created_at AS last_message_at
      FROM drivers dr
      JOIN users u ON u.id = dr.user_id
      LEFT JOIN documents d ON d.driver_id = dr.id
      LEFT JOIN last_message lm ON lm.driver_id = dr.id
      GROUP BY dr.id, u.id, lm.body, lm.sender_role, lm.system_event, lm.created_at
      ORDER BY COALESCE(lm.created_at, dr.created_at) DESC
      `
    );

    return rows;
  }

  async listByDriverId(driverId) {
    const { rows } = await query(
      `
      SELECT
        id,
        driver_id,
        sender_role,
        system_event,
        sender_user_id,
        receiver_user_id,
        body,
        read_by_admin_at,
        read_by_driver_at,
        created_at
      FROM messages
      WHERE driver_id = $1
      ORDER BY created_at ASC
      `,
      [driverId]
    );

    return rows;
  }

  async markReadByAdmin(driverId) {
    
    const { rows } = await query(
      `
      UPDATE messages
      SET read_by_admin_at = NOW()
      WHERE driver_id = $1
        AND sender_role = 'DRIVER'
        AND read_by_admin_at IS NULL
      RETURNING id, read_by_admin_at
      `,
      [driverId]
    );
    return rows;
  }

  async markReadByDriver(driverId) {
    
    const { rows } = await query(
      `
      UPDATE messages
      SET read_by_driver_at = NOW()
      WHERE driver_id = $1
        AND sender_role IN ('ADMIN', 'SYSTEM')
        AND read_by_driver_at IS NULL
      RETURNING id, read_by_driver_at
      `,
      [driverId]
    );
    return rows;
  }

  async create({ driverId, senderRole, systemEvent, senderUserId, receiverUserId, body }) {
    const { rows } = await query(
      `
      INSERT INTO messages (driver_id, sender_role, system_event, sender_user_id, receiver_user_id, body)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [driverId, senderRole, systemEvent || null, senderUserId, receiverUserId, body]
    );

    return rows[0];
  }
}

export default new MessagesRepository();

