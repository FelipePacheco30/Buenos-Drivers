import DriversRepository from './repository.js';

class DriversService {
  async getDashboard(userId) {
    const driver = await DriversRepository.findByUserId(userId);
    if (!driver) throw new Error('Motorista não encontrado');
    return driver;
  }
}

export default new DriversService();
