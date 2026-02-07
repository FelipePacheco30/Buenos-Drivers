import { Router } from 'express';
import VehiclesController from './controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/:driverId', authMiddleware, VehiclesController.create);

export default router;
