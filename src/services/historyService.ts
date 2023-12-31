import dayjs from "dayjs"
import { AppDataSource } from "../dataSource"
import { Export } from "../entity/Export"
import { History, HistoryData, HistoryDetail } from "../global/interfaces/HistoryData"
import { ExportDetail } from "../entity/ExportDetail"
import { formatCurrency, formatNumber } from '../utils/format'

const exportRepository = AppDataSource.getRepository(Export)
const exportDetailRepository = AppDataSource.getRepository(ExportDetail)

const getHistory = (phoneNumber: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let exports: Export[] = await exportRepository.find({
                where: {
                    customer: {
                        phoneNumber: phoneNumber
                    },
                    type: 1,
                },
                order: {
                    exportDate: 'ASC'
                }
            })
            let histories: History[] = []
            if (exports.length > 0) {
                let currentTitle = dayjs(exports[0].exportDate).format('MM/YYYY');
                let historyData: HistoryData[] = []

                for (let exportData of exports) {
                    const exportDetails = await exportDetailRepository.find({
                        where: {
                            export: {
                                id: exportData.id
                            }
                        }
                    })
                    let historiyDetails: HistoryDetail[] = []
                    let totalPrice: number = 0;
                    let totalPriceWithVat: number = 0;
                    for (let exportDetail of exportDetails) {
                        const price = exportDetail.unitPrice * exportDetail.quantity
                        const priceWithVat = exportDetail.unitPrice * exportDetail.quantity * (1 + exportDetail.vat)

                        historiyDetails.push({
                            drugName: exportDetail.drug.name,
                            quantity: formatNumber(exportDetail.quantity),
                            unitPrice: formatCurrency(exportDetail.unitPrice),
                        }
                        )

                        totalPrice += price
                        totalPriceWithVat += priceWithVat
                    }

                    if (currentTitle === dayjs(exportData.exportDate).format('MM/YYYY')) {
                        historyData.push({
                            id: exportData.id,
                            staffName: exportData.staff.name,
                            time: dayjs(exportData.exportDate).format('DD/MM/YYYY HH:mm:ss'),
                            total: formatCurrency(totalPriceWithVat),
                            totalWithoutVat: formatCurrency(totalPrice),
                            vat: formatCurrency(totalPriceWithVat - totalPrice),
                            prescriptionId: exportData.prescriptionId,
                            historyDetail: historiyDetails
                        })
                    }
                    else {
                        histories.push({
                            title: currentTitle,
                            histories: historyData,
                        })
                        historyData = []
                        historyData.push({
                            id: exportData.id,
                            staffName: exportData.staff.name,
                            time: dayjs(exportData.exportDate).format('DD/MM/YYYY HH:mm:ss'),
                            total: formatCurrency(totalPriceWithVat),
                            totalWithoutVat: formatCurrency(totalPrice),
                            vat: formatCurrency(totalPriceWithVat - totalPrice),
                            prescriptionId: exportData.prescriptionId,
                            historyDetail: historiyDetails
                        })
                        currentTitle = dayjs(exportData.exportDate).format('MM/YYYY')
                    }
                }
                histories.push({
                    title: currentTitle,
                    histories: historyData,
                })
            }
            resolve({
                data: histories.map(history => { return { ...history, title: `Tháng ${history.title}` } }),
                message: 'Lấy thông tin lịch sử mua hàng của khách hàng thành công.'
            })
        }
        catch (error) {
            reject(error)
        }
    })
}

export default {
    getHistory
}