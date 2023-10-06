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
        const { 
            name,
            unit,
            price,
            quantity,
            type,
            uses,
            instruction,
        } = req.body
        const quantityConversion = req.body.quantity_conversion
        if (
            !name ||
            !unit ||
            !price ||
            !quantity ||
            !quantityConversion ||
            !type ||
            !uses ||
            !instruction
        ) {
            res.status(400).json({ errorMessage: 'Missing parameters' })
        }
        const data: DrugCategoryData = {
            name,
            unit,
            price,
            quantity,
            quantityConversion,
            type,
            uses,
            instruction,
        }
        const result = await drugCategoryService.storeDrugCategory(data);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateDrugCategory = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            unit,
            price,
            quantity,
            type,
            uses,
            instruction,
        } = req.body
        const quantityConversion = req.body.quantity_conversion
        const data: DrugCategoryData = {
            name,
            unit,
            price,
            quantity,
            quantityConversion,
            type,
            uses,
            instruction,
        }
        const drugCategoryId: number = parseInt(req.params.drugCategoryId);
        const result = await drugCategoryService.updateDrugCategory(drugCategoryId, data);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteDrugCategory = async (req: Request, res: Response) => {
    try {
        const drugCategoryId = parseInt(req.params.drugCategoryId)
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