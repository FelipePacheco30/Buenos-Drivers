import MessagesService from './service.js';
import DocumentsRepository from '../documents/repository.js';

class MessagesController {
  async adminConversations(req, res, next) {
    try {
      const data = await MessagesService.listConversationsForAdmin();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async adminThread(req, res, next) {
    try {
      const { driverId } = req.params;
      const data = await MessagesService.listThreadForAdmin(driverId);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async adminSend(req, res, next) {
    try {
      const { driverId } = req.params;
      const { body } = req.body || {};

      if (!body || String(body).trim().length === 0) {
        return res.status(400).json({ message: 'Mensagem é obrigatória' });
      }

      const msg = await MessagesService.sendAdminMessageRealtime({
        adminUserId: req.user.id,
        driverId,
        body: String(body).trim(),
      });

      return res.status(201).json(msg);
    } catch (err) {
      if (err.message === 'DRIVER_NOT_FOUND') {
        return res.status(404).json({ message: 'Motorista não encontrado' });
      }
      next(err);
    }
  }

  



  async adminSendSystem(req, res, next) {
    try {
      const { driverId } = req.params;
      const { system_event, body } = req.body || {};

      const evt = String(system_event || '').trim();
      if (
        !evt ||
        !['BAN', 'BAN_DOCS', 'DOC_EXPIRING', 'APPROVED', 'REPUTATION_SUSPEND', 'REPUTATION_WARNING'].includes(evt)
      ) {
        return res.status(400).json({ message: 'system_event inválido' });
      }

      const text = String(body || '').trim();
      const driver = await (await import('../drivers/repository.js')).default.getForAdminByDriverId(driverId);
      if (!driver) return res.status(404).json({ message: 'Motorista não encontrado' });

      const documents = await DocumentsRepository.findByDriverId(driverId);
      const defaultBody = MessagesService.buildSystemMessageBody({
        systemEvent: evt,
        driverName: driver.name,
        documents,
        now: new Date(),
      });

      const msg = await MessagesService.sendSystemMessageRealtime({
        driverId,
        systemEvent: evt,
        body: text || defaultBody,
        receiverUserId: driver.user_id,
      });

      return res.status(201).json(msg);
    } catch (err) {
      next(err);
    }
  }

  


  async driverThread(req, res, next) {
    try {
      const data = await MessagesService.listThreadForDriverUser(req.user.id);
      return res.json(data);
    } catch (err) {
      if (err.message === 'DRIVER_NOT_FOUND') {
        return res.status(404).json({ message: 'Motorista não encontrado' });
      }
      next(err);
    }
  }

  


  async driverMarkRead(req, res, next) {
    try {
      const result = await MessagesService.markThreadReadByDriver({
        driverUserId: req.user.id,
      });
      return res.json({ ok: true, updated_count: (result.updated || []).length });
    } catch (err) {
      if (err.message === 'DRIVER_NOT_FOUND') {
        return res.status(404).json({ message: 'Motorista não encontrado' });
      }
      next(err);
    }
  }

  


  async driverSend(req, res, next) {
    try {
      const { body } = req.body || {};
      if (!body || String(body).trim().length === 0) {
        return res.status(400).json({ message: 'Mensagem é obrigatória' });
      }

      const msg = await MessagesService.sendDriverMessageRealtime({
        driverUserId: req.user.id,
        body: String(body).trim(),
      });

      return res.status(201).json(msg);
    } catch (err) {
      if (err.message === 'DRIVER_NOT_FOUND') {
        return res.status(404).json({ message: 'Motorista não encontrado' });
      }
      next(err);
    }
  }
}

export default new MessagesController();

