import express, { Application, Request, Response } from 'express';
import authenticateController from '../controllers/authenticateController';
import staffController from '../controllers/staffController';
import userController from '../controllers/userController';
import customerController from '../controllers/customerController';
import typeByUseController from '../controllers/typeByUseController';
import drugCategoryController from '../controllers/drugCategoryController';
import providerController from '../controllers/providerController';
import importController from '../controllers/importController';
import exportController from '../controllers/exportController';
import roleController from '../controllers/roleController';
import positionController from '../controllers/positionController';
import { checkAccessToken } from '../middlewares/checkAccessToken';
import { checkAdmin } from '../middlewares/checkAdmin';
import statisticsController from '../controllers/statisticsController';

const router = express.Router();

const routesAPI = (app: Application) => {
    //Authentication
    router.post('/login', authenticateController.login)
    router.post('/refresh-token', authenticateController.refreshToken)
    router.post('/change-password', authenticateController.changePassword)

    //Role
    router.get('/roles', roleController.getRoles)

    //User
    router.get('/users', userController.getUsers)
    router.post('/users', userController.storeUser)
    router.put('/users/:userId', userController.updateUser)
    router.delete('/users/:userId', userController.deleteUser)

    //Staff
    router.get('/staffs', staffController.getStaffs)
    router.get('/staffs/:staffId', staffController.getStaff)
    router.post('/staffs', staffController.storeStaff)
    router.post('/staffs/:staffId/update-status', staffController.updateStaffStatus)
    router.put('/staffs/:staffId', staffController.updateStaff)
    router.delete('/staffs/:staffId', staffController.deleteStaff)

    //Position
    router.get('/positions', positionController.getPositions)
    router.get('/positions/:positionId', positionController.getPosition)
    router.post('/positions', positionController.storePosition)
    router.put('/positions/:positionId', positionController.updatePosition)
    router.delete('/positions/:positionId', positionController.deletePosition)

    //Customer
    router.get('/customers', customerController.getCustomers)
    router.post('/customers/search-by-phone-number', customerController.getCustomerByPhoneNumber)
    router.get('/customers/:customerId', customerController.getCustomer)
    router.post('/customers', customerController.storeCustomer)
    router.put('/customers/:customerId', customerController.updateCustomer)
    router.delete('/customers/:customerId', customerController.deleteCustomer)

    //Type by use
    router.get('/type-by-uses', typeByUseController.getTypeByUses)
    router.get('/type-by-uses/:typeId', typeByUseController.getTypeByUse)
    router.post('/type-by-uses', typeByUseController.storeTypeByUse)
    router.put('/type-by-uses/:typeId', typeByUseController.updateTypeByUse)
    router.delete('/type-by-uses/:typeId', typeByUseController.deleteTypeByUse)

    //Drug category
    router.get('/drug-categories', drugCategoryController.getDrugCategories)
    router.get('/drug-categories/:drugId', drugCategoryController.getDrugCategory)
    router.post('/drug-categories', drugCategoryController.storeDrugCategory)
    router.put('/drug-categories/:drugCategoryId', drugCategoryController.updateDrugCategory)
    router.delete('/drug-categories/:drugCategoryId', drugCategoryController.deleteDrugCategory)

    //Provider
    router.get('/providers', providerController.getProviders)
    router.get('/providers/:providerId', providerController.getProvider)
    router.post('/providers', providerController.storeProvider)
    router.put('/providers/:providerId', providerController.updateProvider)
    router.delete('/providers/:providerId', providerController.deleteProvider)

    //Import
    router.get('/imports', importController.getImports)
    router.get('/imports/:importId', importController.getImport)
    router.get('/imports/search', importController.searchImport)
    router.post('/imports', importController.storeImport)
    router.put('/imports/:importId', importController.updateImport)
    router.delete('/imports/:importId', importController.deleteImport)

    //Export
    router.get('/exports', exportController.getExports) 
    router.get('/exports/:exportId', exportController.getExport)
    router.get('/exports/search', exportController.searchExport)
    router.post('/exports', exportController.storeExport)
    router.delete('/exports/:exportId', exportController.deleteExport)

    //Statistics
    router.get('/statistics-today', statisticsController.getStatisticsToday)
    router.post('/statistics', statisticsController.getStatistics)
    

    router.post('/test-login', (req: Request, res: Response) => {
        res.cookie("token", "this is a secret token", {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 14,
                domain: "localhost",
            })
    })

    router.post('/test-logout', (req: Request, res: Response) => {
        res.cookie("refresh-token", null, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 14,
            domain: "localhost",
        })
        .send({
            authenticated: false,
            message: "Logout Successful."
        });
    })

    router.post('/test-auth', (req: Request, res: Response) => {
        console.log(req.cookies)
        console.log(req.cookies?.token)
        if (req.cookies?.token === "this is a secret token") {
            res.send({isAuthenticated: true})
        } else {
            res.send({isAuthenticated: false})
        }
    })

    router.get('/check-middleware', [checkAccessToken, checkAdmin], (req: Request, res: Response) => {
        res.status(200).json({
            message: 'Your access is accepted!'
        })
    })

    return app.use("/api", router);
}

export default routesAPI;