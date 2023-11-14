import { Request, Response } from 'express'
import exportService from '../services/exportService'
import { NewExportDetailData } from '../global/interfaces/ExportDetailData';
import { ExportData } from '../global/interfaces/ExportData';
import { CustomerData } from '../global/interfaces/CustomerData';
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../config/helper';

const getExports = async (req: Request, res: Response) => {
    try {
        const queryParams: QueryParam = await getQueryParams(req)
        const result = await exportService.getExports(queryParams);
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
        const type: number = parseInt(req.body.type)
        const exportDetails: NewExportDetailData[] = req.body.exportDetails
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

        const data: ExportData = {
            note,
            exportDate,
            type,
            staffId,
            prescriptionId,
            customer,
            exportDetails,
        }

        const result = await exportService.storeExport(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

// const updateExport = async (req: Request, res: Response) => {
//     try {
//         const { 
//             note,
//             prescriptionId
//         } = req.body

//         const exportDate: Date = new Date(req.body.exportDate)
//         const customerId: number = parseInt(req.body.customerId)

//         const data: UpdateExportData = {
//             note,
//             exportDate,
//             prescriptionId,
//             customerId,
//         }

//         const existsExportDetail: ExistsExportDetailData[] = req.body.existExportDetail ;
//         const newExportDetail: NewExportDetailData[] = req.body.newExportDetail;
        
//         if (newExportDetail.length === 0 && existsExportDetail.length === 0) {
//             res.status(401).json({
//                 errorMessage: 'Export requires export detail.',
//             })
//             return;
//         }
//         const exportId: number = parseInt(req.params.exportId);
//         const result = await exportService.updateExport(
//             exportId,
//             data,
//             newExportDetail,
//             existsExportDetail,
//         );
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).send(error)
//     }
// }

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
    deleteExport
}