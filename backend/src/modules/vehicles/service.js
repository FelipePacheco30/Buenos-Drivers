import VehiclesRepository from './repository.js';

class VehiclesService {
  async create(data) {
    return VehiclesRepository.create(data);
  }

  async listByUser(userId) {
    return VehiclesRepository.findByUserId(userId);
  }
}

export default new VehiclesService();
