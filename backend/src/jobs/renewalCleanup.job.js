import RenewalsRepository from '../modules/renewals/repository.js';






export default async function renewalCleanupJob() {
  try {
    const removed = await RenewalsRepository.deleteOlderThanDays(7);
    if (removed > 0) {
      console.log(`🧹 Renovations cleanup: removidas ${removed} solicitações antigas`);
    }
  } catch (e) {
    console.log('🧹 Renovations cleanup: erro ao remover solicitações antigas');
  }
}

