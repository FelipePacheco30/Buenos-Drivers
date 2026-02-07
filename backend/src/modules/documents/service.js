import DocumentsRepository from './repository.js';

class DocumentsService {
  async list(driverId) {
    return DocumentsRepository.findByDriver(driverId);
  }
}

export default new DocumentsService();
