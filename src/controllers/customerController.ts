import { Request, Response } from 'express'
import customerService from '../services/customerService'
import { CustomerData } from '../global/interfaces/CustomerData';
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../utils/helper';

const getCustomers = async (req: Request, res: Response) => {
    try {
        if (req.query.perPage) {
            const queryParams: QueryParam = await getQueryParams(req)
            const result = await customerService.getCustomers(queryParams);
            res.status(200).json(result);
        }
        else {
            const result = await customerService.getCustomers(undefined);
            res.status(200).json(result);
        }
       
    } catch (error) {
        res.status(500).send(error)
    }
}

const getCustomerByPhoneNumber = async (req: Request, res: Response) => {
    try {
        const phoneNumber: string = req.body.phoneNumber
        if (!phoneNumber) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await customerService.getCustomerByPhoneNumber(phoneNumber);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const getCustomer = async (req: Request, res: Response) => {
    try {
        const customerId: number = parseInt(req.params.customerId)
        if (!customerId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await customerService.getCustomer(customerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeCustomer = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            phoneNumber,
            address,
            gender,
            email,
        } = req.body

        if (!name || !phoneNumber || !address) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }

        const data: CustomerData = {
            email,
            name,
            address,
            gender,
            phoneNumber,
        }
      
        const result = await customerService.storeCustomer(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            phoneNumber,
            address,
            gender,
            email,
        } = req.body

        if (!name || !phoneNumber || !address || !email) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }

        const data: CustomerData = {
            name,
            email,
            address,
            gender,
            phoneNumber,
        }

        const customerId: number = parseInt(req.params.customerId);
        
        const result = await customerService.updateCustomer(customerId, data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = parseInt(req.params.customerId)
        if (!customerId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await customerService.deleteCustomer(customerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getCustomers,
    getCustomerByPhoneNumber,
    getCustomer,
    storeCustomer,
    updateCustomer,
    deleteCustomer
}