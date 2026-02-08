import NotificationsRepository from './repository.js';
import { sendToUser } from '../../config/websocket.js';

class NotificationsService {
  async notify(userId, payload) {
    await NotificationsRepository.create({
      user_id: userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
    });

    sendToUser(userId, payload);
  }

  async inbox(userId) {
    return NotificationsRepository.list(userId);
  }
}

export default new NotificationsService();
