import PaymentsService from './service.js';
import DriversRepository from '../drivers/repository.js';

class PaymentsController {
  /**
   * Ganhos do motorista
   */
  async earnings(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.user_id);

      const data = await PaymentsService.getEarnings(driver.id);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new PaymentsController();
