import NotificationsService from './service.js';

class NotificationsController {
  async inbox(req, res, next) {
    try {
      const data = await NotificationsService.inbox(req.user.user_id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new NotificationsController();
