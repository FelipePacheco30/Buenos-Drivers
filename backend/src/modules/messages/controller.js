import MessagesService from './service.js';

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

  /**
   * Admin: dispara mensagem automática do SISTEMA (BAN / DOC_EXPIRING / APPROVED)
   * Body opcional: { system_event, body }
   */
  async adminSendSystem(req, res, next) {
    try {
      const { driverId } = req.params;
      const { system_event, body } = req.body || {};

      const evt = String(system_event || '').trim();
      if (!evt || !['BAN', 'DOC_EXPIRING', 'APPROVED'].includes(evt)) {
        return res.status(400).json({ message: 'system_event inválido' });
      }

      const text = String(body || '').trim();
      const defaultBody =
        evt === 'BAN'
          ? 'Conta bloqueada: documento vencido. Atualize seus documentos para voltar a operar.'
          : evt === 'DOC_EXPIRING'
            ? 'Aviso: documento próximo do vencimento. Atualize para evitar bloqueio.'
            : 'Documentos aprovados. Sua conta está liberada para operar.';

      // resolve receiver (user_id do driver)
      // reutiliza DriversRepository via service sendAdminMessageRealtime? aqui vamos pegar pelo drivers repo do serviço
      const driver = await (await import('../drivers/repository.js')).default.getForAdminByDriverId(driverId);
      if (!driver) return res.status(404).json({ message: 'Motorista não encontrado' });

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

  /**
   * Driver: thread com admin/sistema (1 conversa)
   */
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

  /**
   * Driver: marca mensagens como lidas (para “visto” do admin)
   */
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

  /**
   * Driver: envia mensagem para admin (persistência + WS)
   */
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

