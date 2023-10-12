import { Request, Response } from 'express'
import importService from '../services/importService'
import { ImportData } from '../global/interfaces/ImportData';
import { ExistsImportDetailData, NewImportDetailData } from '../global/interfaces/ImportDetailData';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { Import } from '../entity/Import';
import { UpdateImportData } from '../global/interfaces/UpdateImportData';

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

        const importDate: Date = new Date(req.body.import_date)
        const maturityDate: Date = new Date(req.body.maturity_date)
        /////////////////////////////////////res.locals.staffId
        const staffId: number = parseInt(req.body.staff_id);
        const providerId: number = parseInt(req.body.provider_id)

        const importDetails: NewImportDetailData[] = req.body.import_details


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
            paid,
            importDate,
            importDetails,
            maturityDate,
            staffId,
            providerId,
        }

        const result: DataOptionResponse<Import> = await importService.storeImport(data);
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

        const importDate: Date = new Date(req.body.import_date)
        const maturityDate: Date = new Date(req.body.maturity_date)
        const providerId: number = parseInt(req.body.provider_id)

        const data: UpdateImportData = {
            note,
            paid,
            importDate,
            maturityDate,
            providerId,
        }

        const existsImportDetail: ExistsImportDetailData[] = req.body.existImportDetail ;
        const newImportDetail: NewImportDetailData[] = req.body.newImportDetail;

        if (newImportDetail.length === 0 && existsImportDetail.length === 0) {
            res.status(401).json({
                errorMessage: 'Import requires import detail.',
            })
            return;
        }
        const importId: number = parseInt(req.params.importId);
        const result: DataOptionResponse<Import>
            = await importService.updateImport(
                importId,
                data,
                newImportDetail,
                existsImportDetail
            );
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