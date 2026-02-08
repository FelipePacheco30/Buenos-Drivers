import { Router } from 'express';
import NotificationsController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, NotificationsController.inbox);

export default router;
