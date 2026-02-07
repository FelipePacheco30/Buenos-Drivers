import { Router } from 'express';
import DriversController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import roleMiddleware from '../../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('DRIVER'),
  DriversController.dashboard
);

export default router;
