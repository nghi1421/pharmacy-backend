import { Request, Response } from 'express'
import exportService from '../services/exportService'
import { NewExportDetailData } from '../global/interfaces/ExportDetailData';
import { EditExportData, ExportData } from '../global/interfaces/ExportData';
import { CustomerData } from '../global/interfaces/CustomerData';
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../utils/helper';
import mailService from '../services/mailService';
import { ImportQuantityRequired } from '../global/interfaces/QuantityRequired';

const getExports = async (req: Request, res: Response) => {
    try {
        const queryParams: QueryParam = await getQueryParams(req)
        const result = await exportService.getExports(queryParams);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const getTodaySalesCreatedByStaff = async (req: Request, res: Response) => {
    try {
        const result = await exportService.getTodaySalesCreatedByStaff(res.locals.staffId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}



const getExport = async (req: Request, res: Response) => {
    try {
        const exportId: number = parseInt(req.params.exportId)
        const result = await exportService.getExport(exportId);
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
        } = req.body

        const exportDate: Date = new Date(req.body.exportDate)
        const staffId: number = parseInt(res.locals.staffId);
        const type: number = parseInt(req.body.type)

        const exportDetails: NewExportDetailData[]= req.body.exportDetails
        const customer: CustomerData = req.body.customer
        if (exportDetails.length === 0) {
            res.status(400).json({
                errorMessage: 'Vui lòng chọn danh mục thuốc khi thêm phiếu xuất.',
            })
            return;
        }
        if (!exportDate || !staffId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.',
            })
            return;
        }

        const data: ExportData<NewExportDetailData> = {
            note,
            exportDate,
            type,
            staffId,
            customer,
            exportDetails,
        }

        const result = await exportService.storeExport(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeCancelExport = async (req: Request, res: Response) => {
    try {
        const { 
            note,
        } = req.body

        const exportDate: Date = new Date(req.body.exportDate)
        const staffId: number = parseInt(res.locals.staffId);
        const type: number = parseInt(req.body.type)
        const exportDetails: ImportQuantityRequired[] = req.body.exportDetails
        const customer: CustomerData = req.body.customer
        if (exportDetails.length === 0) {
            res.status(400).json({
                errorMessage: 'Vui lòng chọn danh mục thuốc khi thêm phiếu xuất.',
            })
            return;
        }
        if (!exportDate || !staffId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.',
            })
            return;
        }

        const data: ExportData<ImportQuantityRequired> = {
            note,
            exportDate,
            type,
            staffId,
            customer,
            exportDetails,
        }

        const result = await exportService.storeCancelExport(data);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).send(error)
    }
}

const updateExport = async (req: Request, res: Response) => {
    try {
        const { 
            note,
        } = req.body
        const exportId: number = parseInt(req.params.exportId)
        const staffId: number = parseInt(res.locals.staffId);
        const type: number = parseInt(req.body.type)
        const exportDetails: NewExportDetailData[] = req.body.exportDetails
        const customer: CustomerData = req.body.customer
        if (exportDetails.length === 0) {
            res.status(400).json({
                errorMessage: 'Vui lòng chọn danh mục thuốc khi thêm phiếu xuất.',
            })
            return;
        }

        const data: EditExportData = {
            id: exportId,
            note,
            type,
            staffId,
            customer,
            exportDetails,
        }
        const result = await exportService.refundExportAndCreateNewExport(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const refundExport = async (req: Request, res: Response) => {
    try {
        const result = await exportService.refundExport(parseInt(req.params.exportId))
        res.status(200).json(result)
    }
    catch (error) {
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

const testSendMail = (req: Request, res: Response) => {
    mailService.sendOtp('thanhnghi.dev@gmail.com', '002475');
    res.json({
        message: 'Gửi mail thành công.'
    })
}
export default {
    getExports,
    getTodaySalesCreatedByStaff,
    refundExport,
    storeCancelExport,
    updateExport,
    getExport,
    searchExport,
    storeExport,
    deleteExport,
    testSendMail
}