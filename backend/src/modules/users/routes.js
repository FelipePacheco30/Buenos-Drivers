import { Router } from 'express';
import UsersController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', authMiddleware, UsersController.profile);

export default router;
