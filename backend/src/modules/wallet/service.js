import DriversRepository from '../drivers/repository.js';
import WalletRepository from './repository.js';
import { sendToUser } from '../../config/websocket.js';

const PLATFORM_FEE_PERCENT = 25;

function calcNet(price) {
  const gross = Number(price);
  const net = gross * (1 - PLATFORM_FEE_PERCENT / 100);
  return Number(net.toFixed(2));
}

function calcFee(price) {
  const gross = Number(price);
  const fee = gross * (PLATFORM_FEE_PERCENT / 100);
  return Number(fee.toFixed(2));
}

class WalletService {
  async getSummaryByDriver({ driverId }) {
    const wallet = await WalletRepository.ensureForDriverId(driverId);
    const trips = await WalletRepository.listRecentTrips(driverId, 5);

    const normalizedTrips = trips.map((t) => {
      const gross = Number(t.price);
      return {
        ...t,
        gross_amount: gross,
        platform_fee: calcFee(gross),
        net_amount: calcNet(gross),
      };
    });

    return {
      wallet: { id: wallet.id, balance: wallet.balance },
      trips: normalizedTrips,
      platform_fee_percent: PLATFORM_FEE_PERCENT,
    };
  }

  async creditTrip({ driverId, driverUserId, tripId, grossPrice }) {
    const wallet = await WalletRepository.ensureForDriverId(driverId);
    const net = calcNet(grossPrice);
    const newBalance = await WalletRepository.credit({
      walletId: wallet.id,
      tripId,
      amount: net,
    });

    // atualiza também o contador diário (mantemos simples)
    const daily = await DriversRepository.incrementDailyEarnings(driverId, net);

    if (driverUserId) {
      sendToUser(driverUserId, {
        type: 'WALLET_UPDATED',
        balance: newBalance,
        delta: net,
        daily_earnings: daily,
        trip_id: tripId,
      });
      // evento genérico para componentes que preferirem refetch completo
      sendToUser(driverUserId, { type: 'PROFILE_UPDATED', scope: 'WALLET' });
    }

    return { balance: newBalance, net, daily_earnings: daily };
  }

  async withdraw({ driverId, driverUserId, amount }) {
    const wallet = await WalletRepository.ensureForDriverId(driverId);
    const current = Number(wallet.balance);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) throw new Error('AMOUNT_INVALID');
    if (amt > current) throw new Error('INSUFFICIENT_BALANCE');

    const newBalance = await WalletRepository.debit({ walletId: wallet.id, amount: amt });
    if (driverUserId) {
      sendToUser(driverUserId, { type: 'WALLET_UPDATED', balance: newBalance, delta: -amt });
      sendToUser(driverUserId, { type: 'PROFILE_UPDATED', scope: 'WALLET' });
    }
    return { balance: newBalance };
  }
}

export default new WalletService();

