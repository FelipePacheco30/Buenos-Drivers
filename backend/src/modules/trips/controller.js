import TripsService from './service.js';
import DriversRepository from '../drivers/repository.js';

class TripsController {
  /**
   * Inicia uma viagem
   */
  async start(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.user_id);

      const trip = await TripsService.startTrip({
        driverId: driver.id,
        passengerUserId: req.body.user_id,
        type: req.body.type,
      });

      return res.status(201).json(trip);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Finaliza uma viagem ativa
   */
  async finish(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.user_id);

      const trip = await TripsService.finishTrip({
        driverId: driver.id,
        distance: req.body.distance,
        duration: req.body.duration,
      });

      return res.json(trip);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Histórico de viagens do motorista
   */
  async history(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.user_id);
      const trips = await TripsService.history(driver.id);
      return res.json(trips);
    } catch (err) {
      next(err);
    }
  }
}

export default new TripsController();
