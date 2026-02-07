import UsersService from './service.js';

class UsersController {
  async profile(req, res, next) {
    try {
      const user = await UsersService.getProfile(req.user.user_id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

export default new UsersController();
