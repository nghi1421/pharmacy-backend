import { AppDataSource } from "../../dataSource";
import { Export } from "../Export";
import { ExportDetail } from "../ExportDetail";

const exportRepository = AppDataSource.getRepository(Export);
const exportDetailRepository = AppDataSource.getRepository(ExportDetail);

type ExportDetailData = {
    id: number
    drugId: number
    drugName: string
    drugMinimalUnit: string
    expiryDate: Date
    vat: number
    quantity: number
    unitPrice: number
}

type ExportDataReponse = {
    id: number
    exportDate: Date
    createdBy: string
    createdAt: Date
    updatedAt: Date
    customerId: number
    customerName: string
    note: string
    prescriptionId: string
    totalPrice: number
    totalPriceWithVat: number
    exportDetail: ExportDetailData[]
}

export const UserRepository = exportRepository.extend({
    async all() {
        let exports = await this.find()
        const dataReponse: ExportDetailData[] = exports.map(async(myExport: Export) => {
            let exportDetails = await exportDetailRepository.find({
                where: { import: { id: myExport.id }}
            })
            let totalPrice: number = 0;
            let totalPriceWithVat: number = 0;
            for (let exportDetail of exportDetails) {
                totalPrice += exportDetail.unitPrice * exportDetail.quantity
                totalPriceWithVat += exportDetail.unitPrice * exportDetail.quantity * (1 + exportDetail.vat)
            }
            return {
                ...myExport,
                totalPriceWithVat,
                totalPrice,
                createdBy: myExport.staff.name,
                customerName: myExport.customer.name,
                customerId: myExport.customer.id
            }
        })

        return dataReponse;
    },

    async findOneWithExportDetail(exportId: number) {
        let myExport = await exportRepository.findOneByOrFail({ id: exportId })
        let exportDetails = await exportDetailRepository.find({
            where: { import: { id: exportId }}
        })
        let totalPrice: number = 0;
        let totalPriceWithVat: number = 0;
        const exportDetail: ExportDetailData[] = exportDetails.map((exportDetail) => {
            totalPrice += exportDetail.unitPrice * exportDetail.quantity
            totalPriceWithVat += exportDetail.unitPrice * exportDetail.quantity * (1 + exportDetail.vat)
            return {
                ...exportDetail,    
                drugId: exportDetail.drug.id,
                drugName: exportDetail.drug.name,
                drugMinimalUnit: exportDetail.drug.minimalUnit
            }
        })
        let dataResponse: ExportDataReponse = {
            id: myExport.id,
            exportDate: myExport.exportDate,
            createdAt: myExport.createdAt,
            updatedAt: myExport.updatedAt,
            createdBy: myExport.staff.name,
            customerId: myExport.customer.id,
            customerName: myExport.customer.name,
            note: myExport.note,
            prescriptionId: myExport.prescriptionId,
            totalPrice,
            totalPriceWithVat,
            exportDetail
        } 
        return dataResponse;
    },


}) 