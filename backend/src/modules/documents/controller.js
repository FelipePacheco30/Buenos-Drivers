import DocumentsService from './service.js';

class DocumentsController {
  async list(req, res, next) {
    try {
      const docs = await DocumentsService.list(req.params.driverId);
      res.json(docs);
    } catch (err) {
      next(err);
    }
  }
}

export default new DocumentsController();
