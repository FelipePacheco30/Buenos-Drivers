import TripsRepository from './repository.js';
import WalletService from '../wallet/service.js';

class TripsService {
  async startTrip({ driverId, passengerUserId, type, price, origin, destination }) {
    return TripsRepository.createAccepted({
      driverId,
      userId: passengerUserId,
      type,
      price,
      origin,
      destination,
    });
  }

  async finishTrip({ driverId, driverUserId, tripId }) {
    const trip = await TripsRepository.findById(tripId);
    if (!trip) throw new Error('TRIP_NOT_FOUND');
    if (trip.driver_id !== driverId) throw new Error('TRIP_FORBIDDEN');
    if (trip.status === 'COMPLETED') return trip;

    const completed = await TripsRepository.complete(tripId);
    await WalletService.creditTrip({
      driverId,
      driverUserId,
      tripId,
      grossPrice: completed.price,
    });

    return completed;
  }

  async history(driverId) {
    return TripsRepository.findByDriver(driverId);
  }
}

export default new TripsService();
