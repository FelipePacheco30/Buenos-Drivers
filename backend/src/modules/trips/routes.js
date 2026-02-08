import { Router } from 'express';
import TripsController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import roleMiddleware from '../../middlewares/role.middleware.js';

const router = Router();

router.post(
  '/start',
  authMiddleware,
  roleMiddleware('DRIVER'),
  TripsController.start
);

router.get(
  '/history',
  authMiddleware,
  roleMiddleware('DRIVER'),
  TripsController.history
);

export default router;
