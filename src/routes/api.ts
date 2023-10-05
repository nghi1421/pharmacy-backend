import express, { Application } from 'express';
import authenticateController from '../controllers/authenticateController';

const router = express.Router();

const routesAPI = (app: Application) => {
    router.post('/login', authenticateController.login)
    router.post('/refresh-token', authenticateController.refreshToken)

    return app.use("/api", router);
}

export default routesAPI;