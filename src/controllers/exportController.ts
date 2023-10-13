import { Request, Response } from 'express'
import exportService from '../services/exportService'
import { ExistsExportDetailData, NewExportDetailData } from '../global/interfaces/ExportDetailData';
import { ExportData } from '../global/interfaces/ExportData';
import { UpdateExportData } from '../global/interfaces/UpdateExportData';

const getExports = async (req: Request, res: Response) => {
    try {
        const result = await exportService.getExports();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchExport = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        const result = await exportService.searchExport(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeExport = async (req: Request, res: Response) => {
    try {
        const { 
            note,
            prescriptionId,
        } = req.body

        const exportDate: Date = new Date(req.body.exportDate)
        /////////////////////////////////////res.locals.staffId
        const staffId: number = parseInt(req.body.staffId);
        const customerId: number = parseInt(req.body.customerId)

        const exportDetails: NewExportDetailData[] = req.body.exportDetails

        if (exportDetails.length === 0) {
            res.status(401).json({
                errorMessage: 'Export requires export detail.',
            })
            return;
        }
        if (!exportDate || !staffId || !customerId) {
            res.status(401).json({
                errorMessage: 'Missing parameters.',
            })
            return;
        }

        const data: ExportData = {
            note,
            exportDate,
            staffId,
            prescriptionId,
            customerId,
            exportDetails,
        }

        const result = await exportService.storeExport(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateExport = async (req: Request, res: Response) => {
    try {
        const { 
            note,
            prescriptionId
        } = req.body

        const exportDate: Date = new Date(req.body.exportDate)
        const customerId: number = parseInt(req.body.customerId)

        const data: UpdateExportData = {
            note,
            exportDate,
            prescriptionId,
            customerId,
        }

        const existsExportDetail: ExistsExportDetailData[] = req.body.existExportDetail ;
        const newExportDetail: NewExportDetailData[] = req.body.newExportDetail;
        
        if (newExportDetail.length === 0 && existsExportDetail.length === 0) {
            res.status(401).json({
                errorMessage: 'Export requires export detail.',
            })
            return;
        }
        const exportId: number = parseInt(req.params.exportId);
        const result = await exportService.updateExport(
            exportId,
            data,
            newExportDetail,
            existsExportDetail,
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteExport = async (req: Request, res: Response) => {
    try {
        const exportId = parseInt(req.params.exportId)
        const result = await exportService.deleteExport(exportId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}
export default {
    getExports,
    searchExport,
    storeExport,
    updateExport,
    deleteExport
}