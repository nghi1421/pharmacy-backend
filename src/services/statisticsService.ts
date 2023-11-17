import dayjs from "dayjs"
import { AppDataSource } from "../dataSource"
import { ExportDetail } from "../entity/ExportDetail"

const exportDetailRepository = AppDataSource.getRepository(ExportDetail)
// Between(new Date(dayjs().startOf('days').format('YYYY-MM-DD HH:mm:ss'))
//                             , new Date(dayjs().endOf('days').format('YYYY-MM-DD HH:mm:ss')))

const getStatisticsToday =  () => {
    return new Promise(async (resolve, reject) => {
        try {
            const exportDetails = await exportDetailRepository
                .createQueryBuilder('exportDetail')
                .innerJoinAndSelect('exportDetail.export', 'export')
                .innerJoinAndSelect('export.customer', 'customer')
                .where('export.exportDate BETWEEN :startDate AND :endDate', {
                    startDate: new Date(dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss')),
                    endDate: new Date(dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')),
                })
                .getMany();
            
            const salesCount = exportDetails.reduce((sum, exportDetail) => {
                return sum += exportDetail.quantity
            }, 0)

            const salesEarnings = exportDetails.reduce((total, exportDetail) => {
                return total += exportDetail.quantity * exportDetail.unitPrice
            }, 0)

            const customerPurchases = exportDetails.map((exportDetail) => {
                return exportDetail.export.customer.id
            })

            resolve({
                data: {
                    salesCount: salesCount,
                    salesEarnings: salesEarnings,
                    customerPurchases: new Set(customerPurchases).size
                }
            })
        }
        catch (error) {
            reject(error)
        }
    })
}

export default {
    getStatisticsToday
}