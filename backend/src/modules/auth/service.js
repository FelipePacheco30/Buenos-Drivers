import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UsersRepository from '../users/repository.js';

class AuthService {
  async login({ email, password, role }) {
    const user = await UsersRepository.findByEmail(email);

    if (!user || user.role !== role) {
      throw new Error('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        role: user.role,
        status: user.status,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return { token, user };
  }
}

export default new AuthService();
