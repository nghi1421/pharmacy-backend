import express, { Application } from 'express';
import authenticateController from '../controllers/authenticateController';
import staffController from '../controllers/staffController';
import customerController from '../controllers/customerController';
import drugCategoryController from '../controllers/drugCategoryController';
import providerController from '../controllers/providerController';

const router = express.Router();

const routesAPI = (app: Application) => {
    router.post('/login', authenticateController.login)
    router.post('/refresh-token', authenticateController.refreshToken)

    //Staff
    router.get('/staffs', staffController.getStaffs)
    router.get('/staffs/search', staffController.searchStaff)
    router.post('/staffs', staffController.storeStaff)
    router.put('/staffs/:staffId', staffController.updateStaff)
    router.delete('/staffs/:staffId', staffController.deleteStaff)

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

    return app.use("/api", router);
}

export default routesAPI;