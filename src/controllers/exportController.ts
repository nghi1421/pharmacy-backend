import { Request, Response } from 'express'
import exportService from '../services/exportService'
import { NewExportDetailData } from '../global/interfaces/ExportDetailData';
import { ExportData } from '../global/interfaces/ExportData';

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
export default {
    getExports,
    searchExport,
    storeExport,
}