import { EntityManager, In, Like, Repository } from "typeorm"
import { QueryParam } from "../global/interfaces/QueryParam"
import { DataAndCount, getDataAndCount, getErrors, getMetaData } from "../utils/helper"
import { Trouble } from "../entity/Trouble"
import { AppDataSource } from "../dataSource"
import { ImportDetail } from "../entity/ImportDetail"
import { ExportDetail } from "../entity/ExportDetail"
import { TroubleHistorySales } from "../global/interfaces/TroubleHistorySales"
import redisClient from '../config/redis';
import { TroubleData } from "../global/interfaces/TroubleData"
import { Staff } from "../entity/Staff"
import { DrugCategory } from "../entity/DrugCategory"
import inventoryService from "./inventoryService"
import { validate } from "class-validator"
import { Export } from "../entity/Export"
import { Import } from "../entity/Import"
import { Inventory } from "../entity/Inventory"

const troubleRepository: Repository<Trouble> = AppDataSource.getRepository(Trouble)
const importDetailRepository: Repository<ImportDetail> = AppDataSource.getRepository(ImportDetail)
const exportDetailRepository: Repository<ExportDetail> = AppDataSource.getRepository(ExportDetail)
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff)
const drugCategoryRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory)
const importRepository: Repository<Import> = AppDataSource.getRepository(Import)

const getTroubles = (queryParams: QueryParam) => {
    return new Promise(async (resolve, reject) => {
        try {
            const search = queryParams.searchColumns.map((param) => {
                const object: any = {}
                object[param] = Like(`%${queryParams.searchTerm}%`)
                return object
            }
            )

            const order: any = {}
            order[queryParams.orderBy] = queryParams.orderDirection

            const result: DataAndCount = await getDataAndCount(queryParams, troubleRepository, search, order);

            resolve({
                message: 'Lấy thông tin công ty dược thành công.',
                data: result.data,
                meta: await getMetaData(queryParams, result.total)
            })
        }
        catch (error) {
            reject(error);
        }
    })
}

const getHistoryBatchTrouble = (batchId: string, drugId: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const importDetails = await importDetailRepository.find({
                where: {
                    batchId: batchId,
                    drug: {
                        id: drugId
                    }
                }
            })
            const drugCategory = await drugCategoryRepository.findOneBy({ id: drugId })

            if (!drugCategory) {
                reject({ errorMessage: 'Mã danh mục thuốc không tồn tại.' })
            }

            let historySales: TroubleHistorySales[] = []
            if (importDetails.length > 0) {
                const importIds = importDetails.map((importDetail: ImportDetail) => importDetail.import.id)
                const inventoryDrug = await inventoryService.getDrugInventory(drugId)

                let exportDetails: ExportDetail[] = []

                for await (let importId of importIds) {
                    const exportDetail = await exportDetailRepository.find({
                        where: {
                            import: { id: importId },
                            drug: { id: drugId },
                            export: { type: 1 }
                        }
                    })
                    exportDetails = exportDetails.concat(exportDetail)
                }

                const handleImportIds = importIds.filter(importId => inventoryDrug && inventoryDrug.importDetail.import.id >= importId)
                const handleImports = []

                for await (let importId of handleImportIds) {
                    if (inventoryDrug) {
                        if (inventoryDrug.importDetail.import.id > importId) {
                            const importDetail = await importDetailRepository.findOneBy({
                                import: { id: importId },
                                drug: { id: drugId }
                            })

                            if (!importDetail) {
                                return reject({ errorMessage: 'Không tìm thấy chi tiết nhập tương ứng.' })
                            }
                            const brokenHistory = await redisClient.get(`broken-${importDetail.import.id}-${drugId}`)
                            const brokenQuantity = brokenHistory ? parseInt(brokenHistory) : 0

                            handleImports.push({
                                importId,
                                importDate: importDetail.import.importDate,
                                inventory: importDetail.quantity * importDetail.conversionQuantity - brokenQuantity,
                                status: 'not_current'
                            })
                        }
                        else {
                            handleImports.push({
                                importId,
                                importDate: inventoryDrug.importDetail.import.importDate,
                                inventory: inventoryDrug.inventoryImportDetail,
                                status: 'current'
                            })
                        }
                    }
                }

                exportDetails.forEach((exportDetail: ExportDetail) => {
                    historySales.push({
                        exportId: exportDetail.export.id,
                        customer: exportDetail.export.customer,
                        quantity: exportDetail.quantity,
                        drug: exportDetail.drug,
                    })
                })

                await redisClient.hSet(`trouble-list:${batchId}-${drugId}`, {
                    provider: JSON.stringify(importDetails[0].import.provider),
                    historySales: JSON.stringify(historySales),
                    inventoryImport: JSON.stringify(handleImports),
                    drugCategory: JSON.stringify(drugCategory),
                })

                resolve({
                    message: 'Lấy thông tin khách hàng đã mua lô thuốc thành công.',
                    data: {
                        provider: importDetails[0].import.provider,
                        historySales: historySales,
                        inventoryImport: handleImports,
                        drugCategory: drugCategory,
                    }
                })
            }
            else {
                reject({ errorMessage: 'Mã lô thuốc không tồn tại.' })
            }
        }
        catch (error) {
            reject(error);
        }
    })
}

const storeTrouble = (data: TroubleData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const staff: Staff | null = await staffRepository.findOneBy({ id: data.staffId })
            const drug: DrugCategory | null = await drugCategoryRepository.findOneBy({ id: data.drugId })
            const drugInventory: Inventory | null = await inventoryService.getDrugInventory(data.drugId)
            if (!staff) {
                return reject({ errorMessage: 'Không tìm thấy thông tin nhân viên.' })
            }
            if (!drug) {
                return reject({ errorMessage: 'Không tìm thấy thông tin thuốc.' })
            }
            if (!drugInventory) {
                return reject({ errorMessage: 'Không tìm thấy tồn kho thuốc.' })
            }
            const newTrouble = new Trouble()

            newTrouble.staff = staff
            newTrouble.drug = drug
            newTrouble.note = data.note
            newTrouble.troubleDate = data.troubleDate
            newTrouble.batchId = data.batchId

            const errors = await validate(newTrouble);

            if (errors.length > 0) {
                reject({ validateError: getErrors(errors) })
                throw new Error();
            }

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                await transactionalEntityManager.save(newTrouble)
                const importQuantity = await redisClient.hGet(`trouble-list:${data.batchId}-${data.drugId}`, 'inventoryImport')
                const inventories = JSON.parse(importQuantity)
                if (inventories.length > 0) {
                    const newExport = new Export()
                    newExport.exportDate = new Date();
                    newExport.note = 'Lô thuốc bị lỗi.';
                    newExport.staff = staff;
                    newExport.type = 3;

                    const importIds = inventories.map((inventory: any) => inventory.importId)
                    const imports = await importRepository.find({ where: { id: In(importIds) } })
                    await transactionalEntityManager.save(newExport)
                    for (let inventory of inventories) {
                        const myImport = imports.find((importData: Import) => inventory.importId === importData.id)
                        if (!myImport) {
                            throw new Error('Không tìm thấy phiếu nhập.')
                        }
                        const newExportDetail = new ExportDetail()
                        newExportDetail.export = newExport
                        newExportDetail.import = myImport
                        newExportDetail.drug = drug
                        newExportDetail.unitPrice = drug.price
                        newExportDetail.quantity = inventory.inventory
                        newExportDetail.vat = drug.vat
                        newExportDetail.expiryDate = new Date(inventory.expiryDate)

                        const brokenHistory = await redisClient.get(`broken-${inventory.importId}-${data.drugId}`)
                        if (brokenHistory) {
                            await redisClient.del(`broken-${inventory.importId}-${data.drugId}`)
                        }

                        if (inventory.status === 'current') {
                            drugInventory.inventoryQuantiy -= inventory.inventory
                            drugInventory.brokenQuanity += inventory.inventory
                            drugInventory.inventoryImportDetail -= inventory.inventory
                        }
                        else {
                            await redisClient.set(`broken-${inventory.importId}-${data.drugId}`, inventory.inventory)
                            drugInventory.inventoryQuantiy -= inventory.inventory
                            drugInventory.brokenQuanity += inventory.inventory
                        }

                        await transactionalEntityManager.save(newExportDetail);
                    }
                }
            })

        }
        catch (error) {
            reject(error);
        }
    })
}

export default {
    getTroubles,
    getHistoryBatchTrouble,
    storeTrouble
}