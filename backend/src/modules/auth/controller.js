import UsersRepository from '../users/repository.js';

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    const user = await UsersRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // LOGIN SIMPLES (SEM HASH)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  }
}

export default new AuthController();
