import { Request, Response } from 'express'
import drugCategoryService from '../services/drugCategoryService'
import { DrugCategoryData } from '../global/interfaces/DrugCategoryData';
import { getQueryParams } from '../utils/helper';
import { QueryParam } from '../global/interfaces/QueryParam';

const getDrugCategories = async (req: Request, res: Response) => {
    try {
        if (req.query.perPage) {
            const queryParams: QueryParam = await getQueryParams(req)
            const result = await drugCategoryService.getDrugCategories(queryParams);
            res.status(200).json(result);
        }
        else {
            const result = await drugCategoryService.getDrugCategories(undefined);
            res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

const getDrugCategory = async (req: Request, res: Response) => {
    try {
        const drugId: number = parseInt(req.params.drugId)
        if (!drugId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await drugCategoryService.getDrugCategory(drugId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeDrugCategory = async (req: Request, res: Response) => {
    try {
        let { 
            name,
            price,
            unit,
            vat,
            instruction,
            preserved,
            form,
            minimalUnit
        } = req.body

        const conversionQuantity: number = req.body.conversionQuantity
        const typeId: number = req.body.typeId
        price = parseInt(price)
        vat = parseFloat(vat) / 100 as number

        if (!typeId ||
            !name ||
            !unit ||
            !form ||
            !instruction ||
            !preserved ||
            !minimalUnit
        ) {
            res.status(200).json({ errorMessage: 'Thiếu tham số đầu vào.' })
            return;
        }

        const data: DrugCategoryData = {
            typeId,
            name,
            price,
            unit,
            vat,
            form,
            instruction,
            preserved,
            conversionQuantity,
            minimalUnit,
        }
        const result = await drugCategoryService.storeDrugCategory(data);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateDrugCategory = async (req: Request, res: Response) => {
    try {
        let {
            name,
            price,
            unit,
            vat,
            form,
            instruction,
            preserved,
        } = req.body

        const conversionQuantity: number = req.body.conversionQuantity
        const minimalUnit: string = req.body.minimalUnit
        const typeId: number = parseInt(req.body.typeId)
        price = parseInt(price)
        vat = parseFloat(vat) / 100

        const drugCategoryId: number = parseInt(req.params.drugCategoryId);

        if (!typeId ||
            !name ||
            !unit ||
            !instruction ||
            !form ||
            !preserved ||
            !minimalUnit ||
            !drugCategoryId
        ) {
            res.status(400).json({ errorMessage: 'Thiếu tham số đầu vào.' })
            return;
        }

        const data: DrugCategoryData = {
            typeId,
            name,
            price,
            form,
            unit,
            vat,
            instruction,
            preserved,
            conversionQuantity,
            minimalUnit,
        }
        const result = await drugCategoryService.updateDrugCategory(drugCategoryId, data);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteDrugCategory = async (req: Request, res: Response) => {
    try {
        const drugCategoryId = parseInt(req.params.drugCategoryId)
        
        if (!drugCategoryId) {
            res.status(400).json({ errorMessage: 'Thiếu tham số đầu vào.' })
            return;
        }

        const result = await drugCategoryService.deleteDrugCategory(drugCategoryId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getDrugCategories,
    getDrugCategory,
    storeDrugCategory,
    updateDrugCategory,
    deleteDrugCategory
}