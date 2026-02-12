import DocumentsService from './service.js';

class DocumentsController {
  /**
   * Cadastro/atualização de documento (sem PDF/foto)
   * Body:
   * - CNH/CRIMINAL_RECORD: { type, issued_at, expires_at }
   * - CRLV: { type:'CRLV', vehicle_id, issued_at, expires_at }
   */
  async upload(req, res, next) {
    try {
      const document = await DocumentsService.upsertForUser({
        userId: req.user.id,
        ...req.body,
      });

      return res.status(201).json(document);
    } catch (err) {
      if (err.message === 'VEHICLE_REQUIRED') {
        return res.status(400).json({ message: 'vehicle_id é obrigatório para CRLV' });
      }
      if (err.message === 'VEHICLE_NOT_FOUND') {
        return res.status(404).json({ message: 'Veículo não encontrado' });
      }
      next(err);
    }
  }

  /**
   * Lista documentos do motorista logado
   */
  async list(req, res, next) {
    try {
      const documents = await DocumentsService.listForUser(req.user.id);
      return res.json(documents);
    } catch (err) {
      next(err);
    }
  }
}

export default new DocumentsController();
