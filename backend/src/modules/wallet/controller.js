import DriversRepository from '../drivers/repository.js';
import WalletService from './service.js';

class WalletController {
  async summary(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.id);
      if (!driver) return res.status(404).json({ message: 'Motorista não encontrado' });
      const data = await WalletService.getSummaryByDriver({ driverId: driver.id });
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async withdraw(req, res, next) {
    try {
      const driver = await DriversRepository.findByUserId(req.user.id);
      if (!driver) return res.status(404).json({ message: 'Motorista não encontrado' });
      const { amount } = req.body || {};
      const data = await WalletService.withdraw({
        driverId: driver.id,
        driverUserId: req.user.id,
        amount,
      });
      return res.json(data);
    } catch (e) {
      if (e.message === 'AMOUNT_INVALID') {
        return res.status(400).json({ message: 'Valor inválido' });
      }
      if (e.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({ message: 'Saldo insuficiente' });
      }
      next(e);
    }
  }
}

export default new WalletController();

