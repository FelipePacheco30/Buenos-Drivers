import VehiclesService from './service.js';

class VehiclesController {
  /**
   * Cadastra um novo veículo para o motorista logado
   */
  async create(req, res, next) {
    try {
      const vehicle = await VehiclesService.create({
        userId: req.user.user_id,
        ...req.body,
      });

      return res.status(201).json(vehicle);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lista os veículos do motorista logado
   */
  async list(req, res, next) {
    try {
      const vehicles = await VehiclesService.listByUser(req.user.user_id);
      return res.json(vehicles);
    } catch (err) {
      next(err);
    }
  }
}

export default new VehiclesController();
