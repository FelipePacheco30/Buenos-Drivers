import DriversService from './service.js';

class DriversController {
  async dashboard(req, res, next) {
    try {
      const data = await DriversService.getDashboard(req.user.user_id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new DriversController();
