import DocumentsService from './service.js';

class DocumentsController {
  /**
   * Upload / cadastro de documento do motorista logado
   */
  async upload(req, res, next) {
    try {
      const document = await DocumentsService.create({
        userId: req.user.user_id,
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
      const documents = await DocumentsService.listByUser(req.user.user_id);
      return res.json(documents);
    } catch (err) {
      next(err);
    }
  }
}

export default new DocumentsController();
