import DriversRepository from '../drivers/repository.js';
import ReviewsRepository from './repository.js';
import { sendToUser } from '../../config/websocket.js';

class ReviewsService {
  async listNegativeForDriverUser({ driverUserId }) {
    const driver = await DriversRepository.findByUserId(driverUserId);
    if (!driver) throw new Error('DRIVER_NOT_FOUND');
    return ReviewsRepository.listNegativeByDriverId(driver.id, 10);
  }

  async listNegativeForAdminByDriverId({ driverId }) {
    return ReviewsRepository.listNegativeByDriverId(driverId, 50);
  }

  async deleteNegative({ id }) {
    const deleted = await ReviewsRepository.deleteNegativeById(id);
    if (!deleted) return null;

    // notifica motorista em tempo real
    const driver = await DriversRepository.getForAdminByDriverId(deleted.driver_id);
    if (driver?.user_id) {
      sendToUser(driver.user_id, { type: 'REVIEWS_UPDATED' });
      sendToUser(driver.user_id, { type: 'PROFILE_UPDATED', scope: 'REVIEWS' });
    }
    return deleted;
  }
}

export default new ReviewsService();

