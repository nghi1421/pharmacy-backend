import dayjs from "dayjs"
import { AppDataSource } from "../dataSource"
import { ExportDetail } from "../entity/ExportDetail"
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { ImportDetail } from "../entity/ImportDetail"

dayjs.extend(customParseFormat)
const exportDetailRepository = AppDataSource.getRepository(ExportDetail)
const imoportDetailRepository = AppDataSource.getRepository(ImportDetail)

const getStatisticsToday = () => {
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
            const start = dayjs(startDate, 'DD-MM-YYYY')
            const end = dayjs(endDate, 'DD-MM-YYYY')

            if (end.diff(start, 'day') < 0) {
                return reject({
                    errorMessage: 'Thời gian thông kê không hợp lệ'
                })
            }
            const exportDetails = await exportDetailRepository
                .createQueryBuilder('exportDetail')
                .innerJoinAndSelect('exportDetail.drug', 'drug')
                .innerJoinAndSelect('exportDetail.export', 'export')
                .innerJoinAndSelect('export.customer', 'customer')
                .where('export.exportDate BETWEEN :startDate AND :endDate AND export.type = :type', {
                    startDate: new Date(start.startOf('day').format('YYYY-MM-DD HH:mm:ss')),
                    endDate: new Date(end.endOf('day').format('YYYY-MM-DD HH:mm:ss')),
                    type: 1
                })
                .orderBy('export.exportDate')
                .getMany();

            const importDetails = await imoportDetailRepository
                .createQueryBuilder('importDetail')
                .innerJoinAndSelect('importDetail.import', 'import')
                .where('import.importDate BETWEEN :startDate AND :endDate', {
                    startDate: new Date(start.startOf('day').format('YYYY-MM-DD HH:mm:ss')),
                    endDate: new Date(end.endOf('day').format('YYYY-MM-DD HH:mm:ss')),
                })
                .orderBy('import.importDate')
                .getMany();

            let salesCountList = []
            let salesEarningsList = []
            let customerPurchasesList = []
            let labels: string[] = []
            let topSales: {
                id: number
                name: string
                sales: number
            }[] = []
            if (end.diff(start, 'day') === 0) {
                let date = start.set('hour', 0)
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
                        if (topSales.find(sale => sale.id === exportDetails[indexExportDetail].drug.id)) {
                            topSales.map((sale) => sale.id === exportDetails[indexExportDetail].drug.id
                                ? { ...sale, sales: sale.sales + exportDetails[indexExportDetail].quantity }
                                : sale
                            )
                        }
                        else {
                            topSales.push({
                                id: exportDetails[indexExportDetail].drug.id,
                                name: exportDetails[indexExportDetail].drug.name,
                                sales: exportDetails[indexExportDetail].quantity
                            })
                        }
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(customerPurchases.length)
                    date = date.add(1, 'hour')
                }
            }
            else if (end.diff(start, 'day') <= 30) {
                let date = start
                let indexExportDetail = 0
                for (let i = 0; i < end.diff(start, 'day') + 1; i++) {
                    labels.push(date.format('DD/MM'))
                    let salesCount = 0
                    let salesEarnings = 0
                    let customerPurchases = []

                    while (indexExportDetail < exportDetails.length) {
                        if (dayjs(exportDetails[indexExportDetail].export.exportDate).format('DD/MM') !== date.format('DD/MM')) {
                            break;
                        }
                        salesCount += exportDetails[indexExportDetail].quantity;
                        salesEarnings += exportDetails[indexExportDetail].quantity * exportDetails[indexExportDetail].unitPrice;
                        customerPurchases.push(exportDetails[indexExportDetail].export.customer.id)
                        if (topSales.find(sale => sale.id === exportDetails[indexExportDetail].drug.id)) {
                            topSales.map((sale) => sale.id === exportDetails[indexExportDetail].drug.id
                                ? { ...sale, sales: sale.sales + exportDetails[indexExportDetail].quantity }
                                : sale
                            )
                        }
                        else {
                            topSales.push({
                                id: exportDetails[indexExportDetail].drug.id,
                                name: exportDetails[indexExportDetail].drug.name,
                                sales: exportDetails[indexExportDetail].quantity
                            })
                        }
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(customerPurchases.length)

                    date = date.add(1, 'day')
                }
            }
            else if (end.diff(start, 'day') <= 365) {
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
                        if (topSales.find(sale => sale.id === exportDetails[indexExportDetail].drug.id)) {
                            topSales.map((sale) => sale.id === exportDetails[indexExportDetail].drug.id
                                ? { ...sale, sales: sale.sales + exportDetails[indexExportDetail].quantity }
                                : sale
                            )
                        }
                        else {
                            topSales.push({
                                id: exportDetails[indexExportDetail].drug.id,
                                name: exportDetails[indexExportDetail].drug.name,
                                sales: exportDetails[indexExportDetail].quantity
                            })
                        }
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(customerPurchases.length)

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
                        if (topSales.find(sale => sale.id === exportDetails[indexExportDetail].drug.id)) {
                            topSales.map((sale) => sale.id === exportDetails[indexExportDetail].drug.id
                                ? { ...sale, sales: sale.sales + exportDetails[indexExportDetail].quantity }
                                : sale
                            )
                        }
                        else {
                            topSales.push({
                                id: exportDetails[indexExportDetail].drug.id,
                                name: exportDetails[indexExportDetail].drug.name,
                                sales: exportDetails[indexExportDetail].quantity
                            })
                        }
                        indexExportDetail++;
                    }
                    salesCountList.push(salesCount)
                    salesEarningsList.push(salesEarnings)
                    customerPurchasesList.push(customerPurchases.length)

                    date = date.add(1, 'year')
                }
            }
            const salesCount = exportDetails.reduce((sum, exportDetail) => {
                return sum += exportDetail.quantity
            }, 0)
            const salesEarnings = exportDetails.reduce((total, exportDetail) => {
                return total += exportDetail.quantity * exportDetail.unitPrice
            }, 0)
            const customerPurchases = exportDetails.map((exportDetail) => {
                return exportDetail.export.customer.id
            })
            const importQuantity = importDetails.reduce((total, importDetail) => {
                return total += importDetail.quantity * importDetail.conversionQuantity
            }, 0)

            resolve({
                data: {
                    labels,
                    topSales,
                    salesCountList,
                    salesEarningsList,
                    customerPurchasesList,
                    salesCount,
                    salesEarnings,
                    customerPurchases: customerPurchases.length,
                    importQuantity
                },
                message: 'Lấy thông tin thống kê thành công.'
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