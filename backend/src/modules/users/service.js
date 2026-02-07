import UsersRepository from './repository.js';

class UsersService {
  async getProfile(userId) {
    return UsersRepository.findById(userId);
  }
}

export default new UsersService();
