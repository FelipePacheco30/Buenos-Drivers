import DriversService from './service.js';

class DriversController {
  /**
   * Retorna os dados do motorista logado
   */
  async me(req, res, next) {
    try {
      const driver = await DriversService.getByUserId(req.user.user_id);
      return res.json(driver);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Dashboard do motorista (opcional / futura rota)
   */
  async dashboard(req, res, next) {
    try {
      const data = await DriversService.getDashboard(req.user.user_id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new DriversController();
