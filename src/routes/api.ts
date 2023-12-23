import express, { Application } from 'express';
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
import historyController from '../controllers/historyController';
import troubleController from '../controllers/troubleController';
import inventoryController from '../controllers/inventoryController';
import admin from 'firebase-admin'
import chatController from '../controllers/chatController';

const router = express.Router();

const routesAPI = (app: Application) => {
    //Authentication
    router.post('/login', authenticateController.login)
    router.post('/logout', authenticateController.logout)
    router.post('/refresh-token', authenticateController.refreshToken)
    router.post('/change-password', [checkAccessToken], authenticateController.changePassword)
    router.put('/update-profile', [checkAccessToken], authenticateController.updateProfile)
    router.post('/forgot-password', authenticateController.forgotPassword)
    router.post('/set-new-password', authenticateController.setNewPassword)

    //Role
    router.get('/roles', [checkAccessToken, checkAdmin], roleController.getRoles)

    //User
    router.get('/users', [checkAccessToken, checkAdmin], userController.getUsers)
    router.post('/users', [checkAccessToken, checkAdmin], userController.storeUser)
    router.put('/users/:userId', [checkAccessToken, checkAdmin], userController.updateUser)
    router.delete('/users/:userId', [checkAccessToken, checkAdmin], userController.deleteUser)
    router.post('/reset-password/:userId', [checkAccessToken, checkAdmin], userController.resetPassword)
    router.delete('/users/revoke/:staffId', [checkAccessToken, checkAdmin], userController.deleteUserByStaffId)

    //Staff
    router.get('/staffs', [checkAccessToken, checkAdmin], staffController.getStaffs)
    router.get('/staffs/:staffId', [checkAccessToken, checkAdmin], staffController.getStaff)
    router.post('/staffs', [checkAccessToken, checkAdmin], staffController.storeStaff)
    router.post('/staffs/:staffId/update-status', [checkAccessToken, checkAdmin], staffController.updateStaffStatus)
    router.put('/staffs/:staffId', [checkAccessToken, checkAdmin], staffController.updateStaff)
    router.delete('/staffs/:staffId', [checkAccessToken, checkAdmin], staffController.deleteStaff)

    //Position
    router.get('/positions', [checkAccessToken, checkAdmin], positionController.getPositions)
    router.get('/positions/:positionId', [checkAccessToken, checkAdmin], positionController.getPosition)
    router.post('/positions', [checkAccessToken, checkAdmin], positionController.storePosition)
    router.put('/positions/:positionId', [checkAccessToken, checkAdmin], positionController.updatePosition)
    router.delete('/positions/:positionId', [checkAccessToken, checkAdmin], positionController.deletePosition)

    //Customer
    router.get('/customers', [checkAccessToken, checkAdmin], customerController.getCustomers)
    router.post('/customers/search-by-phone-number', [checkAccessToken], customerController.getCustomerByPhoneNumber)
    router.get('/customers/:customerId', [checkAccessToken, checkAdmin], customerController.getCustomer)
    router.post('/customers', [checkAccessToken, checkAdmin], customerController.storeCustomer)
    router.put('/customers/:customerId', [checkAccessToken, checkAdmin], customerController.updateCustomer)
    router.delete('/customers/:customerId', [checkAccessToken, checkAdmin], customerController.deleteCustomer)

    //Type by use
    router.get('/type-by-uses', [checkAccessToken, checkAdmin], typeByUseController.getTypeByUses)
    router.get('/type-by-uses/:typeId', [checkAccessToken, checkAdmin], typeByUseController.getTypeByUse)
    router.post('/type-by-uses', [checkAccessToken, checkAdmin], typeByUseController.storeTypeByUse)
    router.put('/type-by-uses/:typeId', [checkAccessToken, checkAdmin], typeByUseController.updateTypeByUse)
    router.delete('/type-by-uses/:typeId', [checkAccessToken, checkAdmin], typeByUseController.deleteTypeByUse)

    //Drug category
    router.get('/drug-categories', [checkAccessToken], drugCategoryController.getDrugCategories)
    router.get('/drug-categories/:drugId', [checkAccessToken, checkAdmin], drugCategoryController.getDrugCategory)
    router.post('/drug-categories', [checkAccessToken, checkAdmin], drugCategoryController.storeDrugCategory)
    router.put('/drug-categories/:drugCategoryId', [checkAccessToken, checkAdmin], drugCategoryController.updateDrugCategory)
    router.delete('/drug-categories/:drugCategoryId', [checkAccessToken, checkAdmin], drugCategoryController.deleteDrugCategory)

    //Provider
    router.get('/providers', [checkAccessToken, checkAdmin], providerController.getProviders)
    router.get('/providers/:providerId', [checkAccessToken, checkAdmin], providerController.getProvider)
    router.post('/providers', [checkAccessToken, checkAdmin], providerController.storeProvider)
    router.put('/providers/:providerId', [checkAccessToken, checkAdmin], providerController.updateProvider)
    router.delete('/providers/:providerId', [checkAccessToken, checkAdmin], providerController.deleteProvider)

    //Import
    router.get('/imports', [checkAccessToken, checkAdmin], importController.getImports)
    router.get('/imports/:importId', [checkAccessToken, checkAdmin], importController.getImport)
    router.get('/imports-test/:importId', importController.getImport)
    router.get('/imports/search', [checkAccessToken, checkAdmin], importController.searchImport)
    router.post('/imports', [checkAccessToken, checkAdmin], importController.storeImport)
    router.delete('/imports/:importId', [checkAccessToken, checkAdmin], importController.deleteImport)

    //Export
    router.get('/exports', [checkAccessToken, checkAdmin], exportController.getExports)
    router.get('/exports/:exportId', [checkAccessToken], exportController.getExport)
    router.post('/exports/:exportId', [checkAccessToken], exportController.updateExport)
    router.post('/refund-exports/:exportId', [checkAccessToken], exportController.refundExport)
    router.post('/create-cancel-export', [checkAccessToken], exportController.storeCancelExport)
    router.get('/exports/search', [checkAccessToken, checkAdmin], exportController.searchExport)
    router.post('/exports', [checkAccessToken], exportController.storeExport)
    router.get('/exports-today', [checkAccessToken], exportController.getTodaySalesCreatedByStaff)
    router.delete('/exports/:exportId', [checkAccessToken, checkAdmin], exportController.deleteExport)

    //Inventory
    router.get('/inventories', [checkAccessToken, checkAdmin], inventoryController.getInventories)

    //Statistics
    router.get('/statistics-today', [checkAccessToken, checkAdmin], statisticsController.getStatisticsToday)
    router.get('/statistics', [checkAccessToken, checkAdmin], statisticsController.getStatistics)

    //Trouble
    router.get('/troubles/:batchId/:drugId', [checkAccessToken, checkAdmin], troubleController.getHistoryBatchTrouble)
    router.post('/troubles', [checkAccessToken, checkAdmin], troubleController.storeTrouble)
    router.post('/back-drug-category', [checkAccessToken, checkAdmin], troubleController.backDrugCategory)
    router.post('/send-notification', [checkAccessToken, checkAdmin], troubleController.sendNotification)

    //Chat
    router.get('/messages', [checkAccessToken, checkAdmin], chatController.getMessages)

    router.get('/test', (req, res) => {
        res.json({
            message: 'test message'
        })
    })
    //MOBLE ROUTE
    router.post('/mobile/login', authenticateController.loginCustomer)
    router.post('/mobile/verify-email', authenticateController.verifyEmail)
    router.post('/mobile/check-send-otp', authenticateController.checkAndSendOTPCode)
    router.post('/mobile/sign-up', authenticateController.signUpForCustomer)
    router.post('/mobile/change-password', authenticateController.changePasswordCustomer)
    router.get('/mobile/histories/:phoneNumber', historyController.getHistory)
    router.post('/mobile/update-profile/:customerId', customerController.updateCustomer)
    router.get('/mobile/statistics/:customerId', statisticsController.getStatisticsCustomer)
    router.get('/mobile/messages/:roomId', chatController.getMessagesFromRoomId)
    router.post('/mobile/forgot-password', authenticateController.forgotPassword)
    router.post('/mobile/set-new-password', authenticateController.setNewPassword)
    router.get('/mobile/notification', (req, res) => {
        const otp = '002141';

        const message = {
            data: {
                otp: otp
            },
            token: 'dtbCoYAxT9qp12iUqXYqlk:APA91bEBG_j8MK0r0tGlyRhNZvZn6uWRJ1nMw7SvD1U2yudNx1Gf3HwoGIRUrlicoyxMmG7lHoSqJBlfzT5bhmqnRYfiYjCj-24MeI4H5HzsErlF_rPZ5hg6jS2nRcN45_Mw1FpfRiPb'
        };
        console.log(123);
        admin.messaging().send(message).then((response) => {
            console.log('Successfully sent message:', response);
        })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
        res.json({ status: 'success' })
    });

    return app.use("/api", router);
}

export default routesAPI;