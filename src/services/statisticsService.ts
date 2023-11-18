import dayjs from "dayjs"
import { AppDataSource } from "../dataSource"
import { ExportDetail } from "../entity/ExportDetail"

const exportDetailRepository = AppDataSource.getRepository(ExportDetail)

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
                },
                message: 'Lấy thông tin thống kê trong ngày thành công'
            })
        }
        catch (error) {
            reject(error)
        }
    })
}

const getStatistics = (startDate: string, endDate: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const start = dayjs(startDate)
            const end = dayjs(endDate)
            if (end.diff(start, 'day') < 0) {
                return reject({
                    errorMessage: 'Thời gian thông kê không hợp lệ'
                })
            }
            const exportDetails = await exportDetailRepository
                .createQueryBuilder('exportDetail')
                .innerJoinAndSelect('exportDetail.export', 'export')
                .innerJoinAndSelect('export.customer', 'customer')
                .where('export.exportDate BETWEEN :startDate AND :endDate', {
                    startDate: new Date(start.startOf('day').format('YYYY-MM-DD HH:mm:ss')),
                    endDate: new Date(end.endOf('day').format('YYYY-MM-DD HH:mm:ss')),
                })
                .orderBy('export.exportDate')
                .getMany();
            
            let salesCountList = []
            let salesEarningsList = []
            let customerPurchasesList = []
            let labels: string[] = []
            if (end.diff(start, 'day') + 1 === 1) {
                let date = start
                let indexExportDetail = 0
                for (let i = 0; i < 24; i++) {
                    labels.push(date.format('HH:00'))
                    let salesCount = 0
                    let salesEarnings = 0
                    let customerPurchases = []

                    while (indexExportDetail < exportDetails.length) {
                        if (dayjs(exportDetails[indexExportDetail].export.exportDate).format('HH') !== date.format('HH')) {
                            break;
                        }
                        salesCount += exportDetails[indexExportDetail].quantity;
                        salesEarnings += exportDetails[indexExportDetail].quantity * exportDetails[indexExportDetail].unitPrice;
                        customerPurchases.push(exportDetails[indexExportDetail].export.customer.id)
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(new Set(customerPurchases).size)
                    date = date.add(1, 'hour')
                }
            }
            else if (end.diff(start, 'day') + 1 <= 30){
                let date = start
                let indexExportDetail = 0
                for (let i = 0; i < end.diff(start, 'day') + 1; i++) {
                    labels.push(date.format('DD/MM'))
                    let salesCount = 0
                    let salesEarnings = 0
                    let customerPurchases = []

                    while (indexExportDetail < exportDetails.length) {
                        if (dayjs(exportDetails[indexExportDetail].export.exportDate).format('MM/DD') !== date.format('MM/DD')) {
                            break;
                        }
                        salesCount += exportDetails[indexExportDetail].quantity;
                        salesEarnings += exportDetails[indexExportDetail].quantity * exportDetails[indexExportDetail].unitPrice;
                        customerPurchases.push(exportDetails[indexExportDetail].export.customer.id)
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(new Set(customerPurchases).size)
                    date = date.add(1, 'day')
                }
            }
            else if (end.diff(start, 'day') + 1 <= 365) {
                let date = start
                let indexExportDetail = 0
                for (let i = 0; i < end.diff(start, 'month') + 1; i++) {
                    labels.push(date.format('MM/YYYY'))
                    let salesCount = 0
                    let salesEarnings = 0
                    let customerPurchases = []

                    while (indexExportDetail < exportDetails.length) {
                        if (dayjs(exportDetails[indexExportDetail].export.exportDate).format('MM/YYYY') !== date.format('MM/YYYY')) {
                            break;
                        }
                        salesCount += exportDetails[indexExportDetail].quantity;
                        salesEarnings += exportDetails[indexExportDetail].quantity * exportDetails[indexExportDetail].unitPrice;
                        customerPurchases.push(exportDetails[indexExportDetail].export.customer.id)
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(new Set(customerPurchases).size)
                    date = date.add(1, 'month')
                }
            }
            else {
                let date = start
                let indexExportDetail = 0
                for (let i = 0; i < end.diff(start, 'year') + 1; i++) {
                    labels.push(date.format('YYYY'))
                    let salesCount = 0
                    let salesEarnings = 0
                    let customerPurchases = []

                    while (indexExportDetail < exportDetails.length) {
                        if (dayjs(exportDetails[indexExportDetail].export.exportDate).format('YYYY') !== date.format('YYYY')) {
                            break;
                        }
                        salesCount += exportDetails[indexExportDetail].quantity;
                        salesEarnings += exportDetails[indexExportDetail].quantity * exportDetails[indexExportDetail].unitPrice;
                        customerPurchases.push(exportDetails[indexExportDetail].export.customer.id)
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(new Set(customerPurchases).size)
                    date = date.add(1, 'year')
                }
            }
            
            resolve({
                data: {
                    labels,
                    salesCountList,
                    salesEarningsList,
                    customerPurchasesList,
                    exportDetails,
                }
            })
        }
        catch (error) {
            reject(error);
        }
    })
}

export default {
    getStatisticsToday,
    getStatistics
}