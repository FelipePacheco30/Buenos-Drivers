import NotificationsService from './service.js';

class NotificationsController {
  async list(req, res, next) {
    try {
      const data = await NotificationsService.inbox(req.user.user_id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      await NotificationsService.markAsRead({
        notificationId: req.params.id,
        userId: req.user.user_id,
      });
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export default new NotificationsController();
