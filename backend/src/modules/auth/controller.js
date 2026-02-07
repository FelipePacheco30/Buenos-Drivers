import AuthService from './service.js';

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password, role } = req.body;
      const result = await AuthService.login({ email, password, role });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
