import { Request, Response } from 'express'
import typeByUseService from '../services/typeByUseService'
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { TypeByUse } from '../entity/TypeByUse';
import { DataResponse } from '../global/interfaces/DataResponse';

const getTypeByUses = async (req: Request, res: Response) => {
    try {
        const result: DataResponse<TypeByUse> = await typeByUseService.getTypeByUses();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchTypeByUse = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        const result: DataResponse<TypeByUse> = await typeByUseService.searchTypeByUse(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeTypeByUse = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            detail,
        } = req.body

        if (!name || !detail) {
            res.status(400).json({
                errorMessage: 'Missing parameters'
            })
        }

        const result: DataOptionResponse<TypeByUse> = await typeByUseService.storeTypeByUse(name, detail);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateTypeByUse = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            detail,
        } = req.body

        if (!name || !detail) {
            res.status(400).json({
                errorMessage: 'Missing parameters'
            })
        }
        const typeId: number = parseInt(req.params.typeId);
        const result: DataOptionResponse<TypeByUse> = await typeByUseService.updateTypeByUse(typeId, name, detail);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteTypeByUse = async (req: Request, res: Response) => {
    try {
        const typeId = parseInt(req.params.typeId)
        const result: DataOptionResponse<TypeByUse> = await typeByUseService.deleteTypeByUse(typeId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getTypeByUses,
    searchTypeByUse,
    storeTypeByUse,
    updateTypeByUse,
    deleteTypeByUse
}