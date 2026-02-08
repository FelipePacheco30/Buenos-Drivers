import bcrypt from 'bcryptjs';
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

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register({ name, email, password, role }) {
    // 1️⃣ Validação básica
    if (!name || !email || !password || !role) {
      throw new Error('Dados obrigatórios não informados');
    }

    // 2️⃣ Verifica se já existe usuário
    const userExists = await UsersRepository.findByEmail(email);
    if (userExists) {
      throw new Error('E-mail já cadastrado');
    }

    // 3️⃣ Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Cria usuário
    const user = await UsersRepository.create({
      name,
      email,
      password_hash: passwordHash,
      role,
      status: 'ACTIVE',
    });

    // 5️⃣ Gera token automaticamente após registro
    const token = jwt.sign(
      {
        user_id: user.id,
        role: user.role,
        status: user.status,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }
}

export default new AuthService();
