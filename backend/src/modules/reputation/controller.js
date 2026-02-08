import ReputationService from './service.js';

class ReputationController {
  async list(req, res, next) {
    try {
      const data = await ReputationService.getUserReputation(
        req.params.userId
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new ReputationController();
