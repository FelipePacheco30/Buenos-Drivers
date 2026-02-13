import DriversService from './service.js';
import DriversRepository from './repository.js';
import DocumentsRepository from '../documents/repository.js';
import VehiclesRepository from '../vehicles/repository.js';

class DriversController {
  


  async me(req, res, next) {
    try {
      const driver = await DriversService.getByUserId(req.user.id);
      return res.json(driver);
    } catch (err) {
      next(err);
    }
  }

  


  async dashboard(req, res, next) {
    try {
      const data = await DriversService.getDashboard(req.user.id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  


  async adminList(req, res, next) {
    try {
      const drivers = await DriversRepository.listForAdmin();
      return res.json(drivers);
    } catch (err) {
      next(err);
    }
  }

  


  async adminDetail(req, res, next) {
    try {
      const { driverId } = req.params;
      const driver = await DriversRepository.getForAdminByDriverId(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Motorista não encontrado' });
      }

      const documents = await DocumentsRepository.findByDriverId(driverId);
      const vehicles = await VehiclesRepository.findByUserId(driver.user_id);
      return res.json({ ...driver, documents, vehicles });
    } catch (err) {
      next(err);
    }
  }
}

export default new DriversController();
