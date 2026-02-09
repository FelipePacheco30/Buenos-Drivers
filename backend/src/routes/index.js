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
 * Helper para evitar crash silencioso de rota undefined
 */
const safe = (fn, name) => {
  if (typeof fn !== 'function') {
    throw new Error(`❌ Controller method não encontrado: ${name}`);
  }
  return fn;
};

/**
 * =====================
 * Healthcheck
 * =====================
 */
routes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * =====================
 * Rotas públicas
 * =====================
 */
routes.post(
  '/auth/login',
  safe(AuthController.login, 'AuthController.login')
);


/**
 * =====================
 * Rotas autenticadas
 * =====================
 */
routes.use(authMiddleware);

/**
 * =====================
 * Usuário
 * =====================
 */
routes.get(
  '/users/me',
  safe(UsersController.me, 'UsersController.me')
);

routes.put(
  '/users/me',
  safe(UsersController.update, 'UsersController.update')
);

/**
 * =====================
 * Motorista
 * =====================
 */
routes.get(
  '/drivers/me',
  roleMiddleware('DRIVER'),
  safe(DriversController.me, 'DriversController.me')
);

/**
 * =====================
 * Veículos
 * =====================
 */
routes.post(
  '/vehicles',
  roleMiddleware('DRIVER'),
  safe(VehiclesController.create, 'VehiclesController.create')
);

routes.get(
  '/vehicles',
  roleMiddleware('DRIVER'),
  safe(VehiclesController.list, 'VehiclesController.list')
);

/**
 * =====================
 * Documentos
 * =====================
 */
routes.post(
  '/documents',
  roleMiddleware('DRIVER'),
  safe(DocumentsController.upload, 'DocumentsController.upload')
);

routes.get(
  '/documents',
  roleMiddleware('DRIVER'),
  safe(DocumentsController.list, 'DocumentsController.list')
);

/**
 * =====================
 * Viagens
 * =====================
 */
routes.post(
  '/trips/start',
  roleMiddleware('DRIVER'),
  safe(TripsController.start, 'TripsController.start')
);

routes.post(
  '/trips/finish',
  roleMiddleware('DRIVER'),
  safe(TripsController.finish, 'TripsController.finish')
);

routes.get(
  '/trips/history',
  roleMiddleware('DRIVER'),
  safe(TripsController.history, 'TripsController.history')
);

/**
 * =====================
 * Pagamentos
 * =====================
 */
routes.get(
  '/payments/earnings',
  roleMiddleware('DRIVER'),
  safe(PaymentsController.earnings, 'PaymentsController.earnings')
);

/**
 * =====================
 * Reputação
 * =====================
 */
routes.get(
  '/reputation',
  roleMiddleware('DRIVER'),
  safe(ReputationController.get, 'ReputationController.get')
);

/**
 * =====================
 * Rotas permitidas mesmo BANIDO
 * =====================
 */
routes.get(
  '/notifications',
  safe(NotificationsController.list, 'NotificationsController.list')
);

routes.put(
  '/notifications/:id/read',
  safe(
    NotificationsController.markAsRead,
    'NotificationsController.markAsRead'
  )
);

export default routes;
