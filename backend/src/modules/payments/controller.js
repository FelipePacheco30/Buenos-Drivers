import PaymentsService from './service.js';
import DriversRepository from '../drivers/repository.js';

class PaymentsController {
  async wallet(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.user_id);
      const data = await PaymentsService.getWalletData(driver.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new PaymentsController();
