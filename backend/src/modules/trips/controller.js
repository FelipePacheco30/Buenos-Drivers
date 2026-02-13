import TripsService from './service.js';
import DriversRepository from '../drivers/repository.js';

class TripsController {
  


  async start(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.id);
      if (!driver) return res.status(404).json({ message: 'Motorista não encontrado' });

      const trip = await TripsService.startTrip({
        driverId: driver.id,
        passengerUserId: req.body.user_id,
        type: req.body.type,
        price: req.body.price,
        origin: req.body.origin,
        destination: req.body.destination,
      });

      return res.status(201).json(trip);
    } catch (err) {
      next(err);
    }
  }

  


  async finish(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.id);
      if (!driver) return res.status(404).json({ message: 'Motorista não encontrado' });

      const trip = await TripsService.finishTrip({
        driverId: driver.id,
        driverUserId: req.user.id,
        tripId: req.body.trip_id,
      });

      return res.json(trip);
    } catch (err) {
      if (err.message === 'TRIP_NOT_FOUND') return res.status(404).json({ message: 'Viagem não encontrada' });
      if (err.message === 'TRIP_FORBIDDEN') return res.status(403).json({ message: 'Acesso negado' });
      next(err);
    }
  }

  


  async history(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.id);
      if (!driver) return res.status(404).json({ message: 'Motorista não encontrado' });
      const trips = await TripsService.history(driver.id);
      return res.json(trips);
    } catch (err) {
      next(err);
    }
  }
}

export default new TripsController();
