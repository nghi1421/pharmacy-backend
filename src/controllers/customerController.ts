import { Request, Response } from 'express'
import customerService from '../services/customerService'
import { CustomerData } from '../global/interfaces/CustomerData';

const getCustomers = async (req: Request, res: Response) => {
    try {
        const result = await customerService.getCustomers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchCustomer = async (req: Request, res: Response) => {
    try {
        const query = req.body
        const result = await customerService.searchCustomer(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeCustomer = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            phone_number,
            email,
            dob,
            address,
            gender,
        } = req.body

        const data: CustomerData = {
            name,
            email,
            dob,
            address,
            gender,
            phoneNumber: phone_number,
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
            phone_number,
            email,
            dob,
            address,
            gender,
        } = req.body
        const data: CustomerData = {
            name,
            email,
            dob,
            address,
            gender,
            phoneNumber: phone_number,
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
        const result = await customerService.deleteCustomer(customerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getCustomers,
    searchCustomer,
    storeCustomer,
    updateCustomer,
    deleteCustomer
}