import VehiclesService from './service.js';

class VehiclesController {
  async create(req, res, next) {
    try {
      await VehiclesService.addVehicle(req.params.driverId, req.body);
      res.status(201).send();
    } catch (err) {
      next(err);
    }
  }
}

export default new VehiclesController();
