import express, { Application } from 'express';
import authenticateController from '../controllers/authenticateController';
import staffController from '../controllers/staffController';
import userController from '../controllers/userController';
import customerController from '../controllers/customerController';
import drugCategoryController from '../controllers/drugCategoryController';
import providerController from '../controllers/providerController';
import importController from '../controllers/importController';
import roleController from '../controllers/roleController';
import positionController from '../controllers/positionController';
import { checkAccessToken } from '../middlewares/checkAccessToken';

const router = express.Router();

const routesAPI = (app: Application) => {
    router.post('/login', authenticateController.login)
    router.post('/refresh-token', authenticateController.refreshToken)

    //Role
    router.get('/roles', roleController.getRoles)

    //User
    router.get('/users', userController.getUsers)
    router.get('/users/search', userController.searchUser)
    router.post('/users', userController.storeUser)
    router.put('/users/:userId', userController.updateUser)
    router.delete('/users/:userId', userController.deleteUser)

    //Staff
    router.get('/staffs', staffController.getStaffs)
    router.get('/staffs/search', staffController.searchStaff)
    router.post('/staffs', staffController.storeStaff)
    router.put('/staffs/:staffId', staffController.updateStaff)
    router.delete('/staffs/:staffId', staffController.deleteStaff)

    //Position
    router.get('/positions', positionController.getPositions)
    router.get('/positions/search', positionController.searchPosition)
    router.post('/positions', positionController.storePosition)
    router.put('/positions/:positionId', positionController.updatePosition)
    router.delete('/positions/:positionId', positionController.deletePosition)

    //Customer
    router.get('/customers', customerController.getCustomers)
    router.get('/customers/search', customerController.searchCustomer)
    router.post('/customers', customerController.storeCustomer)
    router.put('/customers/:customerId', customerController.updateCustomer)
    router.delete('/customers/:customerId', customerController.deleteCustomer)

    //Drug category
    router.get('/drug-categories', drugCategoryController.getDrugCategories)
    router.get('/drug-categories/search', drugCategoryController.searchDrugCategory)
    router.post('/drug-categories', drugCategoryController.storeDrugCategory)
    router.put('/drug-categories/:drugCategoryId', drugCategoryController.updateDrugCategory)
    router.delete('/drug-categories/:drugCategoryId', drugCategoryController.deleteDrugCategory)

    //Provider
    router.get('/providers', providerController.getProviders)
    router.get('/providers/search', providerController.searchProvider)
    router.post('/providers', providerController.storeProvider)
    router.put('/providers/:providerId', providerController.updateProvider)
    router.delete('/providers/:providerId', providerController.deleteProvider)

    //Import
    router.get('/imports', importController.getImports)
    router.get('/imports/search', importController.searchImport)
    router.post('/imports', importController.storeImport)
    router.put('/imports/:importId', importController.updateImport)
    router.delete('/imports/:importId', importController.deleteImport)

    router.get('/check-middleware', checkAccessToken, (req, res) => {
        res.status(200).json({
            message: 'Your access is accepted!'
        })
    })

    return app.use("/api", router);
}

export default routesAPI;