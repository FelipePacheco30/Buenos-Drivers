import VehiclesService from './service.js';

class VehiclesController {
  


  async create(req, res, next) {
    try {
      const vehicle = await VehiclesService.create({
        userId: req.user.id,
        ...req.body,
      });

      return res.status(201).json(vehicle);
    } catch (err) {
      next(err);
    }
  }

  


  async list(req, res, next) {
    try {
      const vehicles = await VehiclesService.listByUser(req.user.id);
      return res.json(vehicles);
    } catch (err) {
      next(err);
    }
  }
}

export default new VehiclesController();
