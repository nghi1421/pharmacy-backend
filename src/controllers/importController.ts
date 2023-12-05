import { Request, Response } from 'express'
import importService from '../services/importService'
import { ImportData } from '../global/interfaces/ImportData';
import { NewImportDetailData } from '../global/interfaces/ImportDetailData';
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../utils/helper';

const getImports = async (req: Request, res: Response) => {
    try {
        const queryParams: QueryParam = await getQueryParams(req)
        const result = await importService.getImports(queryParams);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const getImport = async (req: Request, res: Response) => {
    try {
        const importId: number = parseInt(req.params.importId)
        const result = await importService.getImport(importId);
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
        } = req.body

        const importDate: Date = new Date(req.body.importDate)
        const staffId: number = parseInt(res.locals.staffId);
        const providerId: number = parseInt(req.body.providerId)

        const importDetails: NewImportDetailData[] = req.body.importDetails


        if (importDetails.length === 0) {
            res.status(401).json({
                errorMessage: 'Import requires import detail.',
            })
            return;
        }
        if (!importDate || !staffId || !providerId) {
            res.status(401).json({
                errorMessage: 'Missing parameters.',
            })
            return;
        }

        const data: ImportData = {
            note,
            importDate,
            importDetails,
            staffId,
            providerId,
        }

        const result = await importService.storeImport(data);
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
    getImport,
    searchImport,
    storeImport,
    deleteImport
}