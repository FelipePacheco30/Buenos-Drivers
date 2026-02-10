import DocumentsRepository from './repository.js';
import DriversRepository from '../drivers/repository.js';

function calcStatus(expiresAt) {
  const today = new Date();
  const exp = new Date(expiresAt);

  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'EXPIRED';
  if (diffDays <= 14) return 'EXPIRING';
  return 'VALID';
}

class DocumentsService {
  async upsertForUser({ userId, type, issued_at, expires_at }) {
    const driver = await DriversRepository.findByUserId(userId);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    const status = calcStatus(expires_at);

    return DocumentsRepository.upsert({
      driverId: driver.id,
      type,
      issuedAt: issued_at,
      expiresAt: expires_at,
      status,
    });
  }

  async listForUser(userId) {
    const driver = await DriversRepository.findByUserId(userId);
    if (!driver) return [];
    return DocumentsRepository.findByDriverId(driver.id);
  }
}

export default new DocumentsService();
