import TripsRepository from './repository.js';
import PaymentsService from '../payments/service.js';
import DriversRepository from '../drivers/repository.js';

class TripsService {
  async startTrip({ driver, userId, type }) {
    if (driver.status === 'BANNED') {
      throw new Error('Motorista banido não pode iniciar viagens');
    }

    const amount = 10.0; // mock
    const platform_fee = amount * 0.25;
    const driver_amount = amount - platform_fee;

    const trip = await TripsRepository.create({
      driver_id: driver.id,
      user_id: userId,
      type,
      amount,
      platform_fee,
      driver_amount,
      status: 'ACCEPTED',
    });

    // simula finalização após 5s
    setTimeout(async () => {
      await TripsRepository.complete(trip.id);
      await PaymentsService.credit(driver.id, trip.id, driver_amount);
    }, 5000);

    return trip;
  }

  async history(driverId) {
    return TripsRepository.findByDriver(driverId);
  }
}

export default new TripsService();
