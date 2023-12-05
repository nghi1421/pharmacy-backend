import { AppDataSource } from "../../dataSource";
import { Import } from "../Import";
import { ImportDetail } from "../ImportDetail";

const importRepository = AppDataSource.getRepository(Import);
const importDetailRepository = AppDataSource.getRepository(ImportDetail);

type ImportDetailData = {
    id: number
    drugName: string
    drugId: number
    expiryDate: Date
    vat: number
    unitPrice: number
    batchId: string
}

type ImportDataReponse = {
    id: number
    importDate: Date
    createdBy: string
    createdAt: Date
    updatedAt: Date
    provideBy: string
    note: string
    totalPrice: number
    totalPriceWithVat: number
    importDetail: ImportDetailData[]
}

export const UserRepository = importRepository.extend({
    async findOneWithImportDetail(importId: number) {
        let myImport = await importRepository.findOneByOrFail({ id: importId })
        let importDetails = await importDetailRepository.find({
            where: { import: { id: importId }}
        })
        let totalPrice: number = 0;
        let totalPriceWithVat: number = 0;
        const importDetail: ImportDetailData[] = importDetails.map((importDetail) => {
            totalPrice += importDetail.unitPrice * importDetail.quantity
            totalPriceWithVat += importDetail.unitPrice * importDetail.quantity * (1 + importDetail.vat)
            return {
                ...importDetail,    
                drugId: importDetail.drug.id,
                drugName: importDetail.drug.name
            }
        })
        let dataResponse: ImportDataReponse = {
            id: myImport.id,
            importDate: myImport.importDate,
            createdAt: myImport.createdAt,
            updatedAt: myImport.updatedAt,
            createdBy: myImport.staff.name,
            provideBy: myImport.provider.name,
            note: myImport.note,
            totalPrice,
            totalPriceWithVat,
            importDetail
        } 
        return dataResponse;
    },
}) 