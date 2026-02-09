import { Router } from 'express';
import AuthController from './controller.js';

const router = Router();

router.post('/login', (req, res) => AuthController.login(req, res));

export default router;
