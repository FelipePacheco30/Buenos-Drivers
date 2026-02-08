import { query } from '../../config/database.js';

class NotificationsRepository {
  async create(data) {
    const { user_id, title, message, type } = data;
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1,$2,$3,$4)`,
      [user_id, title, message, type]
    );
  }

  async list(userId) {
    const { rows } = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

export default new NotificationsRepository();
