import { Router } from 'express';
import DocumentsController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/:driverId', authMiddleware, DocumentsController.list);

export default router;
