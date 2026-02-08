import { Router } from 'express';
import PaymentsController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import roleMiddleware from '../../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/wallet',
  authMiddleware,
  roleMiddleware('DRIVER'),
  PaymentsController.wallet
);

export default router;
