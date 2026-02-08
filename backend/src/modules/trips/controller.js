import TripsService from './service.js';
import DriversRepository from '../drivers/repository.js';

class TripsController {
  async start(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.user_id);
      const trip = await TripsService.startTrip({
        driver,
        userId: req.body.user_id,
        type: req.body.type,
      });
      res.json(trip);
    } catch (err) {
      next(err);
    }
  }

  async history(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.user_id);
      const trips = await TripsService.history(driver.id);
      res.json(trips);
    } catch (err) {
      next(err);
    }
  }
}

export default new TripsController();
