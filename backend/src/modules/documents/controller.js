import DocumentsService from './service.js';

class DocumentsController {
  /**
   * Cadastro/atualização de documento (sem PDF/foto)
   * Body: { type: 'CNH'|'CRLV'|'CRIMINAL_RECORD', issued_at: 'YYYY-MM-DD', expires_at: 'YYYY-MM-DD' }
   */
  async upload(req, res, next) {
    try {
      const document = await DocumentsService.upsertForUser({
        userId: req.user.id,
        ...req.body,
      });

      return res.status(201).json(document);
    } catch (err) {
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
