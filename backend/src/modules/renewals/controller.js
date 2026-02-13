import RenewalsService from './service.js';

class RenewalsController {
  







  async driverCreate(req, res, next) {
    try {
      const { documents, vehicle_add } = req.body || {};
      const created = await RenewalsService.createForDriverUser({
        userId: req.user.id,
        documents,
        vehicleAdd: vehicle_add || null,
      });
      return res.status(201).json(created);
    } catch (err) {
      if (err.message === 'DRIVER_NOT_FOUND') {
        return res.status(404).json({ message: 'Motorista não encontrado' });
      }
      if (err.message === 'EMPTY_RENEWAL') {
        return res.status(400).json({ message: 'Envie ao menos um documento ou um veículo' });
      }
      if (err.message === 'VEHICLE_LIMIT') {
        return res.status(400).json({ message: 'Limite de 2 veículos atingido' });
      }
      if (err.message === 'DOC_NOT_FOUND') {
        return res.status(400).json({ message: 'Documento não encontrado para este motorista' });
      }
      if (err.message === 'DOC_NOT_ELIGIBLE') {
        return res.status(400).json({ message: 'Apenas documentos vencidos ou próximos do vencimento podem ser enviados' });
      }
      if (err.message === 'DATE_INVALID') {
        return res.status(400).json({ message: 'Datas inválidas' });
      }
      if (err.message === 'ISSUED_FUTURE') {
        return res.status(400).json({ message: 'A data de emissão não pode ser no futuro' });
      }
      if (err.message === 'EXPIRES_BEFORE_ISSUED') {
        return res.status(400).json({ message: 'A data de vencimento não pode ser anterior à emissão' });
      }
      if (err.message === 'VEHICLE_BRAND_REQUIRED') {
        return res.status(400).json({ message: 'Marca do veículo é obrigatória' });
      }
      if (err.message === 'VEHICLE_KIND_REQUIRED') {
        return res.status(400).json({ message: 'Tipo do veículo é obrigatório (carro ou moto)' });
      }
      if (err.message === 'VEHICLE_PLATE_INVALID') {
        return res.status(400).json({ message: 'Placa inválida (padrão: AB123CD)' });
      }
      if (err.message === 'VEHICLE_YEAR_INVALID') {
        return res.status(400).json({ message: 'Ano do veículo inválido' });
      }
      if (err.message === 'VEHICLE_FIELDS_REQUIRED') {
        return res.status(400).json({ message: 'Dados do veículo incompletos' });
      }
      next(err);
    }
  }

  


  async adminList(req, res, next) {
    try {
      const data = await RenewalsService.listForAdmin();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  


  async adminDetail(req, res, next) {
    try {
      const { renewalId } = req.params;
      const data = await RenewalsService.getDetailForAdmin(renewalId);
      if (!data) return res.status(404).json({ message: 'Solicitação não encontrada' });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  


  async adminApprove(req, res, next) {
    try {
      const { renewalId } = req.params;
      const data = await RenewalsService.approve({ id: renewalId });
      return res.json(data);
    } catch (err) {
      if (err.message === 'RENEWAL_NOT_FOUND') {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }
      if (err.message === 'RENEWAL_NOT_PENDING') {
        return res.status(400).json({ message: 'Solicitação já foi processada' });
      }
      next(err);
    }
  }
}

export default new RenewalsController();

