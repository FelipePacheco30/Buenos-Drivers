import { query } from '../../config/database.js';

class DocumentsRepository {
  async findByDriver(driverId) {
    const { rows } = await query(
      'SELECT * FROM documents WHERE driver_id = $1',
      [driverId]
    );
    return rows;
  }

  async updateStatus(id, status) {
    await query(
      'UPDATE documents SET status = $1 WHERE id = $2',
      [status, id]
    );
  }
}

export default new DocumentsRepository();
