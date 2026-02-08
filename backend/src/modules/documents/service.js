import DocumentsRepository from './repository.js';

class DocumentsService {
  async create(data) {
    return DocumentsRepository.create(data);
  }

  async listByUser(userId) {
    return DocumentsRepository.findByUserId(userId);
  }
}

export default new DocumentsService();
