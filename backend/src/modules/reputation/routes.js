import { Router } from 'express';
import ReputationController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/:userId', authMiddleware, ReputationController.list);

export default router;
