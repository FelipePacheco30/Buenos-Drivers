import UsersRepository from './repository.js';

class UsersController {
  async me(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await UsersRepository.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      // Placeholder seguro
      return res.json({ message: 'Update user - em desenvolvimento' });
    } catch (err) {
      next(err);
    }
  }
}

export default new UsersController();
