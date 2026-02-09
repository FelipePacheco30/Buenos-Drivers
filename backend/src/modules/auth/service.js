import authRepository from './repository.js';

class AuthService {
  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // login simples (DEV)
    if (user.password_hash !== password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('USER_INACTIVE');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}

export default new AuthService();
