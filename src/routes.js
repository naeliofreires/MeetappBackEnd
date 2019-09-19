import { Router } from 'express';
import multer from 'multer';

// Controllers
import UserController from './app/controllers/UserController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SessionController from './app/controllers/SessionController';
import SubscribeController from './app/controllers/SubscribeController';
import AvailableController from './app/controllers/AvailableController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

// Config
import multerConfig from './config/multer';

const upload = multer({ storage: multerConfig });

const routes = new Router();

routes.get('/availables', AvailableController.index);

routes.get('/meetups', MeetupController.filter);

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.post('/uploads', upload.single('file'), FileController.store);

routes.put('/users', UserController.update);

routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);

routes.get('/subscribes', SubscribeController.index);
routes.post('/subscribes/:idMeetup', SubscribeController.store);

export default routes;
