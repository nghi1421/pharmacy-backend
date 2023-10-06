import express, { Application } from 'express';
import authenticateController from '../controllers/authenticateController';
import staffController from '../controllers/staffController';

const router = express.Router();

const routesAPI = (app: Application) => {
    router.post('/login', authenticateController.login)
    router.post('/refresh-token', authenticateController.refreshToken)

    //Staff
    router.get('/staffs', staffController.getStaffs)
    
    return app.use("/api", router);
}

export default routesAPI;