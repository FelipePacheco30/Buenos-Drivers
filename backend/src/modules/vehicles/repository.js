import { query } from '../../config/database.js';

class VehiclesRepository {
  async findByDriver(driverId) {
    const { rows } = await query(
      'SELECT * FROM vehicles WHERE driver_id = $1',
      [driverId]
    );
    return rows;
  }

  async countActive(driverId) {
    const { rows } = await query(
      'SELECT COUNT(*) FROM vehicles WHERE driver_id = $1 AND is_active = TRUE',
      [driverId]
    );
    return Number(rows[0].count);
  }

  async create(data) {
    const { driver_id, brand, model, plate, year } = data;

    return query(
      `INSERT INTO vehicles (driver_id, brand, model, plate, year)
       VALUES ($1,$2,$3,$4,$5)`,
      [driver_id, brand, model, plate, year]
    );
  }
}

export default new VehiclesRepository();
