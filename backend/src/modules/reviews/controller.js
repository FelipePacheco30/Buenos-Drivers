import ReviewsService from './service.js';

class ReviewsController {
  async driverNegative(req, res, next) {
    try {
      const data = await ReviewsService.listNegativeForDriverUser({
        driverUserId: req.user.id,
      });
      return res.json(data);
    } catch (e) {
      if (e.message === 'DRIVER_NOT_FOUND') {
        return res.status(404).json({ message: 'Motorista não encontrado' });
      }
      next(e);
    }
  }

  async adminNegativeByDriver(req, res, next) {
    try {
      const { driverId } = req.params;
      const data = await ReviewsService.listNegativeForAdminByDriverId({ driverId });
      return res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async adminDeleteNegative(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ReviewsService.deleteNegative({ id });
      if (!deleted) return res.status(404).json({ message: 'Avaliação não encontrada' });
      return res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
}

export default new ReviewsController();

