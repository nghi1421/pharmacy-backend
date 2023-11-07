import { Request, Response } from 'express'
import typeByUseService from '../services/typeByUseService'
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { TypeByUse } from '../entity/TypeByUse';
import { DataResponse } from '../global/interfaces/DataResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { getQueryParams } from '../config/helper';
import { QueryParam } from '../global/interfaces/QueryParam';

const getTypeByUses = async (req: Request, res: Response) => {
    try {
        if (req.query.perPage) {
            const queryParams: QueryParam = await getQueryParams(req)
            const result: DataResponse<TypeByUse> = await typeByUseService.getTypeByUses(queryParams);
            res.status(200).json(result);
        }
        else {
            const result = await typeByUseService.getTypeByUses(undefined);
            res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

const getTypeByUse = async (req: Request, res: Response) => {
    try {
        const typeId: number = parseInt(req.params.typeId)
        const result: GetDataResponse<TypeByUse> = await typeByUseService.getTypeByUse(typeId); 
         res.status(200).json(result);
    }
    catch (error) {
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
                errorMessage: 'Thiếu tham số.'
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
                errorMessage: 'Thiếu tham số.'
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
    getTypeByUse,
    storeTypeByUse,
    updateTypeByUse,
    deleteTypeByUse
}