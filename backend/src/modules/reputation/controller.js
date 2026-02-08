import ReputationService from './service.js';

class ReputationController {
  async get(req, res, next) {
    try {
      const data = await ReputationService.getUserReputation(
        req.params.userId
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new ReputationController();
