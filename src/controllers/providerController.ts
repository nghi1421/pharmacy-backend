import { Request, Response } from 'express'
import providerService from '../services/providerService'
import { ProviderData } from '../global/interfaces/ProviderData';

const getProviders = async (req: Request, res: Response) => {
    try {
        const result = await providerService.getProviders();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchProvider = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        const result = await providerService.searchProvider(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeProvider = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            phone_number,
            email,
            address,
        } = req.body

        if (!name || !phone_number || !email) {
            res.status(400).json({
                errorMessage: 'Missing parameters'
            })
        }

        const data: ProviderData = {
            name,
            email,
            address,
            phoneNumber: phone_number,
        }
        const result = await providerService.storeProvider(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateProvider = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            phone_number,
            email,
            address,
        } = req.body

        if (!name || !phone_number || !email) {
            res.status(400).json({
                errorMessage: 'Missing parameters'
            })
        }

        const data: ProviderData = {
            name,
            email,
            address,
            phoneNumber: phone_number,
        }
        const providerId: number = parseInt(req.params.providerId);
        const result = await providerService.updateProvider(providerId, data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteProvider = async (req: Request, res: Response) => {
    try {
        const providerId = parseInt(req.params.providerId)
        const result = await providerService.deleteProvider(providerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getProviders,
    searchProvider,
    storeProvider,
    updateProvider,
    deleteProvider
}