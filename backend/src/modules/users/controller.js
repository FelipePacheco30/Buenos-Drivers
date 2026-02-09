import UsersRepository from './repository.js';

class UsersController {
  async me(req, res) {
    return res.json(req.user);
  }

  async update(req, res) {
    const updated = await UsersRepository.update(req.user.id, req.body);
    return res.json(updated);
  }
}

export default new UsersController();
