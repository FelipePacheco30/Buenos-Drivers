import PaymentsRepository from './repository.js';

class PaymentsService {
  async credit(driverId, tripId, amount) {
    const wallet = await PaymentsRepository.getWallet(driverId);
    if (!wallet) return;
    await PaymentsRepository.credit(wallet.id, tripId, amount);
  }

  async getWalletData(driverId) {
    const wallet = await PaymentsRepository.getWallet(driverId);
    const history = await PaymentsRepository.history(wallet.id);
    return { wallet, history };
  }
}

export default new PaymentsService();
