import PaymentsRepository from './repository.js';

class PaymentsService {
  async getEarnings(driverId) {
    return PaymentsRepository.getEarningsByDriver(driverId);
  }
}

export default new PaymentsService();
