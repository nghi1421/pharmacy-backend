import { Request, Response } from 'express'
import providerService from '../services/providerService'
import { ProviderData } from '../global/interfaces/ProviderData';
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../utils/helper';

const getProviders = async (req: Request, res: Response) => {
    try {
        if (req.query.perPage) {
            const queryParams: QueryParam = await getQueryParams(req)
            const result = await providerService.getProviders(queryParams);
            res.status(200).json(result);
        }
        else {
            const result = await providerService.getProviders(undefined);
            res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

const getProvider = async (req: Request, res: Response) => {
    try {
        const providerId: number = parseInt(req.params.providerId)
        if (!providerId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await providerService.getProvider(providerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeProvider = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            phoneNumber,
            email,
            address,
        } = req.body

        if (!name || !phoneNumber || !email) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }

        const data: ProviderData = {
            name,
            email,
            address,
            phoneNumber,
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
            phoneNumber,
            email,
            address,
        } = req.body

        if (!name || !phoneNumber || !email) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }

        const data: ProviderData = {
            name,
            email,
            address,
            phoneNumber
        }
        const providerId: number = parseInt(req.params.providerId);
        if (!providerId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
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
        if (!providerId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getProviders,
    getProvider,
    storeProvider,
    updateProvider,
    deleteProvider
}