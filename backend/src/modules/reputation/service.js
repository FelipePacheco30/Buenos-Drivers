import ReputationRepository from './repository.js';

class ReputationService {
  async getUserReputation(userId) {
    return ReputationRepository.findByTarget(userId);
  }
}

export default new ReputationService();
