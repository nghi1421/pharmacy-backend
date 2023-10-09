import { Request, Response } from 'express'
import drugCategoryService from '../services/drugCategoryService'
import { DrugCategoryData } from '../global/interfaces/DrugCategoryData';

const getDrugCategories = async (req: Request, res: Response) => {
    try {
        const result = await drugCategoryService.getDrugCategories();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchDrugCategory = async (req: Request, res: Response) => {
    try {
        const query = req.body
        const result = await drugCategoryService.searchDrugCategory(query);
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
            form
        } = req.body

        const quantityConversion: number = req.body.quantity_conversion
        const minimalUnit: string = req.body.minimal_unit
        const typeId: number = req.body.type_id
        price = parseInt(price)
        vat = parseFloat(vat)

        if (!typeId ||
            !name ||
            !price ||
            !unit ||
            !vat ||
            !form ||
            !instruction ||
            !preserved ||
            !quantityConversion ||
            !minimalUnit
        ) {
            res.status(400).json({ errorMessage: 'Missing parameter' })
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
            quantityConversion,
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

        const quantityConversion: number = req.body.quantity_conversion
        const minimalUnit: string = req.body.minimal_unit
        const typeId: number = req.body.type_id
        price = parseInt(price)
        vat = parseFloat(vat)

        const drugCategoryId: number = parseInt(req.params.drugCategoryId);

        if (!typeId ||
            !name ||
            !price ||
            !unit ||
            !vat ||
            !instruction ||
            !form ||
            !preserved ||
            !quantityConversion ||
            !minimalUnit ||
            !drugCategoryId
        ) {
            res.status(400).json({ errorMessage: 'Missing parameter' })
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
            quantityConversion,
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
            res.status(400).json({ errorMessage: 'Missing parameter' })
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
    searchDrugCategory,
    storeDrugCategory,
    updateDrugCategory,
    deleteDrugCategory
}