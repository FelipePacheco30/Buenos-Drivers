import TripsRepository from './repository.js';

class TripsService {
  async startTrip({ driverId, passengerUserId, type }) {
    return TripsRepository.start({
      driverId,
      passengerUserId,
      type,
    });
  }

  async finishTrip({ driverId, distance, duration }) {
    return TripsRepository.finish({
      driverId,
      distance,
      duration,
    });
  }

  async history(driverId) {
    return TripsRepository.findByDriver(driverId);
  }
}

export default new TripsService();
