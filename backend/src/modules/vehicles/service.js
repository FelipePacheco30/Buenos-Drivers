import VehiclesRepository from './repository.js';

class VehiclesService {
  async addVehicle(driverId, vehicle) {
    const total = await VehiclesRepository.countActive(driverId);

    if (total >= 2) {
      throw new Error('Limite de veículos atingido');
    }

    await VehiclesRepository.create({ ...vehicle, driver_id: driverId });
  }
}

export default new VehiclesService();
