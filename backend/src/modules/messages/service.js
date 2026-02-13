import MessagesRepository from './repository.js';
import DriversRepository from '../drivers/repository.js';
import UsersRepository from '../users/repository.js';
import { sendToUser } from '../../config/websocket.js';

class MessagesService {
  async listConversationsForAdmin() {
    return MessagesRepository.listConversationsForAdmin();
  }

  async listByDriverId(driverId) {
    return MessagesRepository.listByDriverId(driverId);
  }

  async markThreadReadByAdmin({ driverId }) {
    const updated = await MessagesRepository.markReadByAdmin(driverId);
    if (!updated || updated.length === 0) return { updated: [] };

    const driver = await DriversRepository.getForAdminByDriverId(driverId);
    if (driver?.user_id) {
      sendToUser(driver.user_id, {
        type: 'CHAT_READ',
        driver_id: driverId,
        reader_role: 'ADMIN',
        ids: updated.map((u) => u.id),
        read_at: updated[0]?.read_by_admin_at || null,
      });
    }
    return { updated };
  }

  async markThreadReadByDriver({ driverUserId }) {
    const driver = await DriversRepository.findByUserId(driverUserId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    const updated = await MessagesRepository.markReadByDriver(driver.id);
    if (!updated || updated.length === 0) return { updated: [], driverId: driver.id };

    const admins = await UsersRepository.listAdmins();
    admins.forEach((a) =>
      sendToUser(a.id, {
        type: 'CHAT_READ',
        driver_id: driver.id,
        reader_role: 'DRIVER',
        ids: updated.map((u) => u.id),
        read_at: updated[0]?.read_by_driver_at || null,
      })
    );

    return { updated, driverId: driver.id };
  }

  async listThreadForAdmin(driverId) {
    await this.markThreadReadByAdmin({ driverId });
    return MessagesRepository.listByDriverId(driverId);
  }

  async sendAdminMessage({ adminUserId, driverId, body }) {
    const driver = await DriversRepository.getForAdminByDriverId(driverId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    const message = await MessagesRepository.create({
      driverId,
      senderRole: 'ADMIN',
      systemEvent: null,
      senderUserId: adminUserId,
      receiverUserId: driver.user_id,
      body,
    });

    return message;
  }

  async sendAdminMessageRealtime({ adminUserId, driverId, body }) {
    const message = await this.sendAdminMessage({ adminUserId, driverId, body });

    
    const driver = await DriversRepository.getForAdminByDriverId(driverId);
    const admins = await UsersRepository.listAdmins();

    const payload = {
      type: 'CHAT_MESSAGE',
      driver_id: driverId,
      message,
    };

    if (driver?.user_id) sendToUser(driver.user_id, payload);
    admins.forEach((a) => sendToUser(a.id, payload));

    return message;
  }

  async sendDriverMessageRealtime({ driverUserId, body }) {
    const driver = await DriversRepository.findByUserId(driverUserId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    const admins = await UsersRepository.listAdmins();
    const primaryAdmin = admins[0];

    const message = await MessagesRepository.create({
      driverId: driver.id,
      senderRole: 'DRIVER',
      systemEvent: null,
      senderUserId: driverUserId,
      receiverUserId: primaryAdmin?.id || null,
      body,
    });

    const payload = {
      type: 'CHAT_MESSAGE',
      driver_id: driver.id,
      message,
    };

    
    sendToUser(driverUserId, payload);
    admins.forEach((a) => sendToUser(a.id, payload));

    return message;
  }

  async listThreadForDriverUser(driverUserId) {
    const driver = await DriversRepository.findByUserId(driverUserId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }
    return MessagesRepository.listByDriverId(driver.id);
  }

  async sendSystemMessageRealtime({ driverId, systemEvent, body, receiverUserId }) {
    const admins = await UsersRepository.listAdmins();

    const message = await MessagesRepository.create({
      driverId,
      senderRole: 'SYSTEM',
      systemEvent,
      senderUserId: null,
      receiverUserId: receiverUserId || null,
      body,
    });

    const payload = {
      type: 'CHAT_MESSAGE',
      driver_id: driverId,
      message,
    };

    
    if (receiverUserId) sendToUser(receiverUserId, payload);
    admins.forEach((a) => sendToUser(a.id, payload));

    return message;
  }
}

export default new MessagesService();

