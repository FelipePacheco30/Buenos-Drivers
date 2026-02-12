import VehiclesRepository from './repository.js';

class VehiclesService {
  async create(data) {
    const existing = await VehiclesRepository.findByUserId(data.userId);
    if (Array.isArray(existing) && existing.length >= 2) {
      const err = new Error('VEHICLE_LIMIT');
      throw err;
    }
    return VehiclesRepository.create(data);
  }

  async listByUser(userId) {
    return VehiclesRepository.findByUserId(userId);
  }
}

export default new VehiclesService();
