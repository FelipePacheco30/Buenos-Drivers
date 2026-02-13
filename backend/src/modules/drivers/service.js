import DriversRepository from './repository.js';

class DriversService {
  async getByUserId(userId) {
    const driver = await DriversRepository.findByUserId(userId);

    if (!driver) {
      throw new Error('Motorista não encontrado');
    }

    return driver;
  }

  async getDashboard(userId) {
    
    return {
      message: 'Dashboard em construção',
      userId,
    };
  }
}

export default new DriversService();
