import express, { Application } from 'express';
import authenticateController from '../controllers/authenticateController';

const router = express.Router();

const routesAPI = (app: Application) => {
    router.post('/login', authenticateController.login)

    return app.use("/api", router);
}

export default routesAPI;