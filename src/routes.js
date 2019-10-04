import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetUpController from './app/controllers/MeetupController';
import AuthMiddleware from './app/middlewares/auth';
import OrganizerController from './app/controllers/OrganizerController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => res.json({ version: 'V1' }));

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(AuthMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/meetup', upload.single('file'), MeetUpController.store);
routes.put('/meetup/:id', upload.single('file'), MeetUpController.update);
routes.delete('/meetup/:id', MeetUpController.delete);

routes.get('/organized', OrganizerController.index);
export default routes;
