import { Request, Response } from 'express'
import importService from '../services/importService'
import { ImportData } from '../global/interfaces/ImportData';

const getImports = async (req: Request, res: Response) => {
    try {
        const result = await importService.getImports();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchImport = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        const result = await importService.searchImport(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeImport = async (req: Request, res: Response) => {
    try {
        const { 
            note,
            paid,
        } = req.body

        const importDate = new Date(req.body.import_date)
        const maturityDate = new Date(req.body.maturity_date)
        const staffId = parseInt(res.locals.staffId);
        const providerId = parseInt(req.body.provider_id)

        const data: ImportData = {
            note,
            paid,
            importDate,
            maturityDate,
            staffId,
            providerId,
        }
        const result = await importService.storeImport(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateImport = async (req: Request, res: Response) => {
    try {
        const { 
            note,
            paid,
        } = req.body

        const importDate = new Date(req.body.import_date)
        const maturityDate = new Date(req.body.maturity_date)
        const staffId = parseInt(res.locals.staffId);
        const providerId = parseInt(req.body.provider_id)

        const data: ImportData = {
            note,
            paid,
            importDate,
            maturityDate,
            staffId,
            providerId,
        }
        const importId: number = parseInt(req.params.importId);
        const result = await importService.updateImport(importId, data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteImport = async (req: Request, res: Response) => {
    try {
        const importId = parseInt(req.params.importId)
        const result = await importService.deleteImport(importId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getImports,
    searchImport,
    storeImport,
    updateImport,
    deleteImport
}