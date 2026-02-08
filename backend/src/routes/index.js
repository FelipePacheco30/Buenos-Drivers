import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

// Controllers
import AuthController from '../modules/auth/controller.js';
import UsersController from '../modules/users/controller.js';
import DriversController from '../modules/drivers/controller.js';
import VehiclesController from '../modules/vehicles/controller.js';
import DocumentsController from '../modules/documents/controller.js';
import TripsController from '../modules/trips/controller.js';
import PaymentsController from '../modules/payments/controller.js';
import ReputationController from '../modules/reputation/controller.js';
import NotificationsController from '../modules/notifications/controller.js';

const routes = Router();

/**
 * =====================
 * Rotas públicas
 * =====================
 */
routes.post('/auth/login', AuthController.login);
routes.post('/auth/register', AuthController.register);

/**
 * =====================
 * Rotas autenticadas
 * =====================
 */
routes.use(authMiddleware);

// Usuário
routes.get('/users/me', UsersController.me);
routes.put('/users/me', UsersController.update);

// Motorista
routes.get('/drivers/me', roleMiddleware('DRIVER'), DriversController.me);

// Veículos
routes.post('/vehicles', roleMiddleware('DRIVER'), VehiclesController.create);
routes.get('/vehicles', roleMiddleware('DRIVER'), VehiclesController.list);

// Documentos
routes.post('/documents', roleMiddleware('DRIVER'), DocumentsController.upload);
routes.get('/documents', roleMiddleware('DRIVER'), DocumentsController.list);

// Viagens
routes.post('/trips/start', roleMiddleware('DRIVER'), TripsController.start);
routes.post('/trips/finish', roleMiddleware('DRIVER'), TripsController.finish);
routes.get('/trips/history', roleMiddleware('DRIVER'), TripsController.history);

// Pagamentos (bloqueado se BANIDO pelo middleware de role)
routes.get('/payments/earnings', roleMiddleware('DRIVER'), PaymentsController.earnings);

// Reputação
routes.get('/reputation', roleMiddleware('DRIVER'), ReputationController.get);

// =====================
// Rotas permitidas mesmo BANIDO
// =====================
routes.get('/notifications', NotificationsController.list);
routes.put('/notifications/:id/read', NotificationsController.markAsRead);

export default routes;
