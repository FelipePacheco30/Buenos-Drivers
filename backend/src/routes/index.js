import { Router } from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';


import AuthController from '../modules/auth/controller.js';
import UsersController from '../modules/users/controller.js';
import DriversController from '../modules/drivers/controller.js';
import VehiclesController from '../modules/vehicles/controller.js';
import DocumentsController from '../modules/documents/controller.js';
import TripsController from '../modules/trips/controller.js';
import PaymentsController from '../modules/payments/controller.js';
import ReputationController from '../modules/reputation/controller.js';
import NotificationsController from '../modules/notifications/controller.js';
import MessagesController from '../modules/messages/controller.js';
import RenewalsController from '../modules/renewals/controller.js';
import WalletController from '../modules/wallet/controller.js';
import ReviewsController from '../modules/reviews/controller.js';

const routes = Router();




const safe = (fn, name) => {
  if (typeof fn !== 'function') {
    throw new Error(`❌ Controller method não encontrado: ${name}`);
  }
  return fn;
};






routes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});






routes.post(
  '/auth/login',
  safe(AuthController.login, 'AuthController.login')
);







routes.use(authMiddleware);






routes.get(
  '/users/me',
  safe(UsersController.me, 'UsersController.me')
);

routes.put(
  '/users/me',
  safe(UsersController.update, 'UsersController.update')
);






routes.get(
  '/drivers/me',
  roleMiddleware('DRIVER'),
  safe(DriversController.me, 'DriversController.me')
);






routes.get(
  '/admin/drivers',
  roleMiddleware('ADMIN'),
  safe(DriversController.adminList, 'DriversController.adminList')
);

routes.get(
  '/admin/drivers/:driverId',
  roleMiddleware('ADMIN'),
  safe(DriversController.adminDetail, 'DriversController.adminDetail')
);






routes.get(
  '/admin/messages',
  roleMiddleware('ADMIN'),
  safe(MessagesController.adminConversations, 'MessagesController.adminConversations')
);

routes.get(
  '/admin/messages/:driverId',
  roleMiddleware('ADMIN'),
  safe(MessagesController.adminThread, 'MessagesController.adminThread')
);

routes.post(
  '/admin/messages/:driverId',
  roleMiddleware('ADMIN'),
  safe(MessagesController.adminSend, 'MessagesController.adminSend')
);

routes.post(
  '/admin/messages/:driverId/system',
  roleMiddleware('ADMIN'),
  safe(MessagesController.adminSendSystem, 'MessagesController.adminSendSystem')
);






routes.get(
  '/driver/messages',
  roleMiddleware('DRIVER'),
  safe(MessagesController.driverThread, 'MessagesController.driverThread')
);

routes.post(
  '/driver/messages',
  roleMiddleware('DRIVER'),
  safe(MessagesController.driverSend, 'MessagesController.driverSend')
);

routes.post(
  '/driver/messages/read',
  roleMiddleware('DRIVER'),
  safe(MessagesController.driverMarkRead, 'MessagesController.driverMarkRead')
);






routes.post(
  '/driver/renewals',
  roleMiddleware('DRIVER'),
  safe(RenewalsController.driverCreate, 'RenewalsController.driverCreate')
);






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






routes.get(
  '/admin/renewals',
  roleMiddleware('ADMIN'),
  safe(RenewalsController.adminList, 'RenewalsController.adminList')
);

routes.get(
  '/admin/renewals/:renewalId',
  roleMiddleware('ADMIN'),
  safe(RenewalsController.adminDetail, 'RenewalsController.adminDetail')
);

routes.post(
  '/admin/renewals/:renewalId/approve',
  roleMiddleware('ADMIN'),
  safe(RenewalsController.adminApprove, 'RenewalsController.adminApprove')
);






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






routes.get(
  '/driver/wallet',
  roleMiddleware('DRIVER'),
  safe(WalletController.summary, 'WalletController.summary')
);

routes.post(
  '/driver/wallet/withdraw',
  roleMiddleware('DRIVER'),
  safe(WalletController.withdraw, 'WalletController.withdraw')
);






routes.get(
  '/driver/reviews/negative',
  roleMiddleware('DRIVER'),
  safe(ReviewsController.driverNegative, 'ReviewsController.driverNegative')
);

routes.get(
  '/admin/drivers/:driverId/reviews/negative',
  roleMiddleware('ADMIN'),
  safe(ReviewsController.adminNegativeByDriver, 'ReviewsController.adminNegativeByDriver')
);

routes.delete(
  '/admin/reviews/negative/:id',
  roleMiddleware('ADMIN'),
  safe(ReviewsController.adminDeleteNegative, 'ReviewsController.adminDeleteNegative')
);






routes.get(
  '/payments/earnings',
  roleMiddleware('DRIVER'),
  safe(PaymentsController.earnings, 'PaymentsController.earnings')
);






routes.get(
  '/reputation',
  roleMiddleware('DRIVER'),
  safe(ReputationController.get, 'ReputationController.get')
);






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
