import { Export } from '../entity/Export' 
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate, validateOrReject } from "class-validator"
import { Staff } from '../entity/Staff';
import { EntityManager, Like, Repository } from 'typeorm';
import { ExportData } from '../global/interfaces/ExportData';
import { ExportDetail } from '../entity/ExportDetail';
import { Customer } from '../entity/Customer';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { DataAndCount, getDataAndCount, getErrors, getMetaData } from '../utils/helper';
import { Inventory } from '../entity/Inventory';
import importService from './importService'
import { ImportDetail } from '../entity/ImportDetail';
import inventoryService from './inventoryService'
import drugCategoryCache from '../cache/DrugCategoryCache';
import { QueryParam } from '../global/interfaces/QueryParam';

const exportRepository: Repository<Export> = AppDataSource.getRepository(Export);
const exportDetailRepository: Repository<ExportDetail> = AppDataSource.getRepository(ExportDetail);
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer);

const getExports = (queryParams: QueryParam | undefined): Promise<DataResponse<Export>> => {
    return new Promise(async (resolve, reject) => {
        try {
            if (queryParams) {
                const search  = queryParams.searchColumns.map((param) => {
                    const object:any = {}
                        object[param] = Like(`%${queryParams.searchTerm}%`)
                        return object
                    }
                )
                
                const order: any = {}
                order[queryParams.orderBy] = queryParams.orderDirection

                const result: DataAndCount = await getDataAndCount(queryParams, exportRepository, search, order);
        
                resolve({
                    message: 'Lấy thông tin phiếu xuất hàng thành công.',
                    data: result.data,
                    meta: await getMetaData(queryParams, result.total)
                })    
            }
            else {
                const data: Export[] = await exportRepository.find();

                resolve({
                    message: 'Lấy thông tin phiếu xuất hàng thành công.',
                    data
                })  
            }
        } catch (error) {
            reject(error);
        }
    })
}

const getExport = (exportId: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const exportData: null | Export = await exportRepository.findOneBy({ id: exportId});
            if (exportData) {
                const exportDetailData = await exportDetailRepository.find({ where: { export: { id: exportData.id } } })
                const resultDetailData = []
                let totalPrice: number = 0;
                let totalPriceWithVat: number = 0;
                for (let exportDetail of exportDetailData) {
                    const price = exportDetail.unitPrice * exportDetail.quantity
                    const priceWithVat = exportDetail.unitPrice * exportDetail.quantity * (1 + exportDetail.vat)

                    resultDetailData.push({
                            ...exportDetail,
                            price,
                            priceWithVat,
                        })
                    
                    totalPrice += price
                    totalPriceWithVat += priceWithVat
                }
                resolve({
                    message: 'Lấy thông tin phiếu xuất hàng thành công.',
                    data: {
                        export: { ...exportData, totalPriceWithVat, totalPrice: totalPrice},
                        exportDetail: resultDetailData
                    },
                })
            }
            else {
                reject({
                    errorMessage: 'Phiếu xuất hàng không tồn tại. Vui lòng làm mới trang.'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

const searchExport = (query: Object): Promise<DataResponse<Export>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const exports = await exportRepository.find({ where: query});
            resolve({
                message: 'Search exports successfully',
                data: exports
            })
        } catch (error) {
            reject(error);
        }
    })
}

const storeExport = (data: ExportData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const staff: Staff|null = await staffRepository.findOneBy({ id: data.staffId });
            if (staff === null) {
                return reject({ errorMessage: 'Thông tin nhân viên không tồn tại.' });
            }

            let customer: Customer|null = await customerRepository.findOneBy({ phoneNumber: data.customer.phoneNumber });
            

            let newExport = new Export();

            newExport.exportDate = data.exportDate;
            newExport.note = data.note;
            newExport.prescriptionId = data.prescriptionId
            newExport.staff = staff;
            
            newExport.type = data.type;

            await validateOrReject(newExport)

            const errors = await validate(newExport);
            if (errors.length > 0) {
                return reject({ validateError: getErrors(errors) });
            }

            if (data.exportDetails.length === 0) {
                return resolve({ errorMessage: 'Vui lòng chọn danh mục thuốc.'})
            }

            const isEnough = await inventoryService.checkInventory(data.exportDetails as QuantityRequired[])

            if (!isEnough) {
                return resolve({ errorMessage: 'Tồn kho thuốc không đủ.'})
            }

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                if (customer === null) {
                    const newCustomer = new Customer()
                    newCustomer.address = data.customer.address
                    newCustomer.name = data.customer.name
                    newCustomer.gender = data.customer.gender
                    newCustomer.phoneNumber = data.customer.phoneNumber

                    const errors = await validate(newCustomer)

                    if (errors.length > 0) {
                        reject({ validateError: getErrors(errors) })
                        throw new Error();
                    }
                    customer = await transactionalEntityManager.save(newCustomer)
                }
                else {
                    customer.address = data.customer.address
                    customer.name = data.customer.name
                    customer.gender = data.customer.gender
                    customer.phoneNumber = data.customer.phoneNumber

                    const errors = await validate(customer)

                    if (errors.length > 0) {
                        reject({ validateError: getErrors(errors) })
                        throw new Error();
                    }

                    customer = await transactionalEntityManager.save(customer)
                }
                newExport.customer = customer;
            
                await transactionalEntityManager.save(newExport)
                
                if (data.type === 1) {
                    for (let exportDetail of data.exportDetails) {
                        let drugInventory: Inventory | null = await inventoryService.getDrugInventoryThisMonth(exportDetail.drugId);

                        if (!drugInventory) {
                            resolve({
                                errorMessage: `Mã thuốc ${exportDetail.drugId} không tồn. Vui lòng làm mới danh mục thuốc để cập nhật thông tin danh mục thuốc mới..`,
                            }); 
                            throw new Error();
                        }
                        let inventory = drugInventory.inventoryImportDetail - exportDetail.quantity;
                        
                        if (inventory > 0) {
                            const newExportDetail = new ExportDetail()
                            newExportDetail.export = newExport
                            newExportDetail.import = drugInventory.importDetail.import
                            newExportDetail.drug = drugInventory.drug
                            newExportDetail.unitPrice = drugInventory.drug.price
                            newExportDetail.quantity = exportDetail.quantity
                            newExportDetail.vat = drugInventory.drug.vat
                            newExportDetail.expiryDate = new Date(drugInventory.importDetail.expiryDate)

                            drugInventory.salesQuantity += exportDetail.quantity
                            drugInventory.inventoryQuantiy -= exportDetail.quantity
                            drugInventory.inventoryImportDetail -= exportDetail.quantity
                            
                            const errors = await validate(newExportDetail)
                            if (errors.length > 0) {
                                reject({ validateError: getErrors(errors) })
                                throw new Error();
                            }

                            await transactionalEntityManager.save(drugInventory);
                            await transactionalEntityManager.save(newExportDetail);
                            }
                        else {
                            let index: number = 0;
                            const importDetails: ImportDetail[] =
                                await importService.getImportDetailsAfter(
                                    drugInventory.drug.id,
                                    drugInventory.importDetail.id
                                )
                            const handledExportDetails: {importDetail: ImportDetail, quantity: number}[] = []

                            inventory = drugInventory.inventoryImportDetail + inventory

                            while (inventory < 0) {
                                if (index === 0){
                                    handledExportDetails.push({
                                        importDetail: importDetails[index],
                                        quantity: drugInventory.inventoryImportDetail,
                                    })  
                                }
                                else {
                                    handledExportDetails.push({
                                        importDetail: importDetails[index],
                                        quantity: importDetails[index].quantity *  importDetails[index].conversionQuantity
                                    })
                                }
                                inventory = importDetails[++index].quantity + inventory
                            }
                            handledExportDetails.push({
                                importDetail: importDetails[index],
                                quantity: inventory
                            })

                            drugInventory.importDetail = importDetails[index]
                            drugInventory.inventoryImportDetail = inventory
                            drugInventory.inventoryQuantiy = drugInventory.inventoryQuantiy - exportDetail.quantity
                            drugInventory.salesQuantity += exportDetail.quantity

                            handledExportDetails.forEach(async (handledExportDetail) => {
                                const newExportDetail = new ExportDetail();

                                newExportDetail.export = newExport
                                newExportDetail.import = handledExportDetail.importDetail.import
                                newExportDetail.drug = handledExportDetail.importDetail.drug
                                newExportDetail.unitPrice = handledExportDetail.importDetail.drug.price
                                newExportDetail.quantity = handledExportDetail.quantity
                                newExportDetail.vat = handledExportDetail.importDetail.drug.vat
                                newExportDetail.expiryDate = new Date(handledExportDetail.importDetail.expiryDate)

                                const errors = await validate(newExportDetail)

                                if (errors.length > 0) {
                                    reject({ validateError: getErrors(errors) })
                                    throw new Error();
                                }

                                await transactionalEntityManager.save(newExportDetail);
                            })
                            await transactionalEntityManager.save(drugInventory);
                        }
                    }
                }
            })
            const exportDetailData = await exportDetailRepository.find({ where: { export: { id: newExport.id } } })
            const resultDetailData = []
            let totalPrice: number = 0;
            let totalPriceWithVat: number = 0;
            for (let exportDetail of exportDetailData) {
                const price = exportDetail.unitPrice * exportDetail.quantity
                const priceWithVat = exportDetail.unitPrice * exportDetail.quantity * (1 + exportDetail.vat)

                resultDetailData.push({
                    ...exportDetail,
                        totalPrice: price,
                    })
                
                totalPrice += price
                totalPriceWithVat += priceWithVat
            }
            drugCategoryCache.setDrugCategories(null)
            resolve({
                message: 'Thêm mới thông tin phiếu nhập thành công.',
                data: {
                    export: { ...newExport, totalPriceWithVat, totalPrice: totalPrice},
                    exportDetail: resultDetailData
                },
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateExport = () => {

}

const deleteExport = (exportId: number): Promise<DataOptionResponse<Export>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let myExport: Export = await exportRepository.findOneByOrFail({ id: exportId });

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                const exportDetail = await exportDetailRepository.find({
                    where: {
                        export: { 
                            id: myExport.id,
                        },
                    },
                })
            
                await transactionalEntityManager.getRepository(ExportDetail).remove(exportDetail);

                await transactionalEntityManager.getRepository(Export).delete(exportId);
            })

            resolve({
                message: 'Export deleted successfully',
                data: myExport
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getExports,
    getExport,
    searchExport,
    storeExport,
    updateExport,
    deleteExport
}