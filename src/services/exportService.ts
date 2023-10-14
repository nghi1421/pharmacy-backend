import { Export } from '../entity/Export'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { Staff } from '../entity/Staff';
import { EntityManager, In, MoreThan, Not, Repository } from 'typeorm';
import { ImportDetail } from '../entity/ImportDetail';
import { DrugCategory } from '../entity/DrugCategory';
import { ExportData } from '../global/interfaces/ExportData';
import { ExportDetail } from '../entity/ExportDetail';
import { Customer } from '../entity/Customer';
import { UpdateExportData } from '../global/interfaces/UpdateExportData';
import { ExistsExportDetailData, NewExportDetailData } from '../global/interfaces/ExportDetailData';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';

const exportRepository: Repository<Export> = AppDataSource.getRepository(Export);
const importDetailRepository: Repository<ImportDetail> = AppDataSource.getRepository(ImportDetail);
const exportDetailRepository: Repository<ExportDetail> = AppDataSource.getRepository(ExportDetail);
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer);
const drugRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory);

const getExports = (): Promise<DataResponse<Export>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const exports = await exportRepository.find();
            resolve({
                message: 'Get exports successfully',
                data: exports
            })
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
                return reject({ errorMessage: 'Staff not found.' });
            }

            const customer: Customer|null = await customerRepository.findOneBy({ id: data.customerId });
            if (customer === null) {
                return reject({ errorMessage: 'Customer not found.' });
            }

            let myExport = new Export();

            myExport.exportDate = data.exportDate;
            myExport.note = data.note;
            myExport.prescriptionId = data.prescriptionId

            myExport.staff = staff;
            myExport.customer = customer;

            await validateOrReject(myExport)

            let drugIds: number[] = data.exportDetails.map((exportDetail) => {
                return exportDetail.drugId
            })

            const drugs: DrugCategory[] = await drugRepository.find(
                {
                    where: { id: In(drugIds) }
                }
            );
            if (drugs.length === 0) {
                return reject({ errorMessage: 'Drug category not found.' });
            }

            for (let i = 0; i < drugs.length; i++) {
                if (drugs[i].quantity < data.exportDetails[i].quantity) {
                    return reject({ errorMessage: 'Quantity in stock is not enough.' });
                }
            }

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                
                await transactionalEntityManager.save(myExport)

                let handledExportDetail = []

                for (let exportDetail of data.exportDetails) {
                    let drug: DrugCategory | undefined = drugs.find(
                        (drug: DrugCategory) => drug.id === exportDetail.drugId
                    );
                    const importDetail = await importDetailRepository.find({
                        where: {
                            drug: { id: exportDetail.drugId },
                            quantity: MoreThan(0)
                        },
                        order: {
                            import: {
                                importDate: 'ASC'
                            }
                        }
                    }) 

                    if (!drug) {
                        return reject({ errorMessage: 'Drug category not found' })
                    }

                    const quantity = importDetail[0].quantity - exportDetail.quantity;
                    if (quantity >= 0) {
                        importDetail[0].quantity = importDetail[0].quantity - exportDetail.quantity
                        await transactionalEntityManager.save(importDetail[0])

                        handledExportDetail.push({
                            ...exportDetail,
                            drug: drug,
                            export: myExport,
                            import: importDetail[0].import,
                            expiryDate: importDetail[0].expiryDate,
                            vat: drug.vat,
                            unitPrice: drug.price,
                        })
                    }
                    else {
                        
                        handledExportDetail.push({
                            ...exportDetail,
                            drug: drug,
                            export: myExport,
                            import: importDetail[0].import,
                            expiryDate: importDetail[0].expiryDate,
                            vat: drug.vat,
                            unitPrice: drug.price,
                            quantity: importDetail[0].quantity
                        })
                        handledExportDetail.push({
                            ...exportDetail,
                            drug: drug,
                            export: myExport,
                            import: importDetail[1].import,
                            expiryDate: importDetail[1].expiryDate,
                            vat: drug.vat,
                            unitPrice: drug.price,
                            quantity: -quantity
                        })
                        importDetail[0].quantity = 0
                        await transactionalEntityManager.save(importDetail[0])
                        importDetail[1].quantity = importDetail[1].quantity + quantity
                        await transactionalEntityManager.save(importDetail[1])
                    }   
                    drug.quantity = drug.quantity - exportDetail.quantity
                    await transactionalEntityManager.save(drug)
                }

                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(ExportDetail)
                    .values(handledExportDetail)
                    .execute()
            })
            const exportDetailData = await exportDetailRepository.find({ where: { export: { id: myExport.id } } })
            const resultDetailData = []
            let totalPrice: number = 0;
            let totalPriceWithVat: number = 0;
            for (let exportDetail of exportDetailData) {
                const price = exportDetail.unitPrice * exportDetail.quantity
                const priceWithVat = exportDetail.unitPrice * exportDetail.quantity * (1 + exportDetail.vat)

                resultDetailData.push(
                    {
                        ...exportDetail,
                        price,
                        priceWithVat,
                    })
                
                totalPrice += price
                totalPriceWithVat += priceWithVat
            }
            resolve({
                message: 'Insert export successfully',
                data: {
                    export: { ...myExport, totalPriceWithVat, totalPrice: totalPrice},
                    exportDetail: resultDetailData
                },
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateExport = (
    exportId: number,
    data: UpdateExportData,
    newExportDetail: NewExportDetailData[],
    existsExportDetail: ExistsExportDetailData[],
) => {
    return new Promise(async (resolve, reject) => {
        try {

            let myExport: Export = await exportRepository.findOneByOrFail({ id: exportId });
            const customer: Customer | null = await customerRepository.findOneBy({ id: data.customerId });
            if (customer === null) {
                return reject({ errorMessage: 'Customer not found.' });
            }

            myExport.note = data.note;
            myExport.exportDate = data.exportDate;
            myExport.prescriptionId = data.prescriptionId

            myExport.customer = customer;

            await validateOrReject(myExport)

            let newDrugIds: number[] = newExportDetail.map((exportDetail) => {
                return exportDetail.drugId
            })
            let oldDrugIds: number[] = existsExportDetail.map((exportDetail) => {
                return exportDetail.drugId
            })
            const newDrugs: DrugCategory[] = await drugRepository.find(
                {
                    where: { id: In(newDrugIds) }
                }
            );
            const oldDrugs: DrugCategory[] = await drugRepository.find(
                {
                    where: { id: In(oldDrugIds) }
                }
            );

            if (newDrugs.length === 0 && oldDrugs.length === 0) {
                return reject({ errorMessage: 'Drug category not found.' });
            }

            for (let i = 0; i < newDrugs.length; i++) {
                if (newDrugs[i].quantity < newExportDetail[i].quantity) {
                    return reject({ errorMessage: 'Quantity in stock is not enough.' });
                }
            }
            for (let i = 0; i < oldDrugs.length; i++) {
                let quantity = existsExportDetail[i].quantity - existsExportDetail[i].oldQuantity
                if (quantity >= 0) {
                    if (oldDrugs[i].quantity < quantity) {
                        return reject({ errorMessage: 'Quantity in stock is not enough.' });
                    }
                }
            }

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                await transactionalEntityManager.save(myExport)

                const existsExportDetailIds: number[] = existsExportDetail.map((existsExportDetail) => {
                    return existsExportDetail.id
                })
                const exportDetailEliminated = await exportDetailRepository.find({
                    where: { id: Not(In(existsExportDetailIds)) }
                })
                await transactionalEntityManager.getRepository(ExportDetail).remove(exportDetailEliminated)
                
                existsExportDetail = existsExportDetail.filter(
                    exportDetail => exportDetail.quantity !== exportDetail.oldQuantity
                )
                let drugIds: number[] = newExportDetail.map((ExportDetail: NewExportDetailData) => {
                    return ExportDetail.drugId
                })
                drugIds = drugIds.concat(existsExportDetail.map((ExportDetail: ExistsExportDetailData) => {
                    return ExportDetail.drugId
                }))
                const drugs: DrugCategory[] = await drugRepository.find(
                    {
                        where: { id: In(drugIds) }
                    }
                );

                if (drugs.length === 0) {
                    reject({ errorMessage: 'Export requires export details' })
                    return;
                }
                
                let drugUpdate = []
                let existExportDetailEntity = await exportDetailRepository.find({
                    where: { id: In(existsExportDetailIds)}
                })

                let handledExportDetail = []
                let handledImportDetail = []
                for (let exportDetail of existsExportDetail) {
                    let updateExportDetail = existExportDetailEntity.find((e) => e.id === exportDetail.id)

                    if (!updateExportDetail) {
                        return reject({ errorMessage: 'Export detail not found' })
                    }
                    let drug: DrugCategory | undefined = drugs.find(
                        (drug: DrugCategory) => drug.id === exportDetail.drugId
                    );
                    if (!drug) {
                        return reject({ errorMessage: 'Drug category not found.'})
                    }
                    let differentQuantity = exportDetail.quantity - exportDetail.oldQuantity
                    drug.quantity = drug.quantity - differentQuantity;   
                    drugUpdate.push(drug); 

                    const importDetail = await importDetailRepository.find({
                        where: {
                            drug: { id: exportDetail.drugId },
                            quantity: MoreThan(0)
                        },
                        order: {
                            import: {
                                importDate: 'ASC'
                            }
                        }
                    })
                    if (differentQuantity >= 0) {
                        if (importDetail[0].quantity >= differentQuantity) {
                            if (importDetail[0].import.id === updateExportDetail.import.id) {
                                updateExportDetail.quantity = exportDetail.quantity;
                                updateExportDetail.unitPrice = drug.price;
                                updateExportDetail.vat = drug.vat;
                                importDetail[0].quantity = importDetail[0].quantity - differentQuantity

                                handledImportDetail.push(importDetail[0])
                                handledExportDetail.push(updateExportDetail)  
                            }
                            else {
                                let newExportDetail = new ExportDetail()
                                newExportDetail.quantity = importDetail[0].quantity - differentQuantity;
                                newExportDetail.unitPrice = drug.price;
                                newExportDetail.vat = drug.vat;
                                newExportDetail.drug = drug;
                                newExportDetail.export = myExport;
                                newExportDetail.import = importDetail[0].import;
                                importDetail[0].quantity = importDetail[0].quantity - differentQuantity

                                handledImportDetail.push(importDetail[0])
                                handledExportDetail.push(newExportDetail)
                            }
                        } else {
                            const left: number = exportDetail.quantity - importDetail[0].quantity

                            if (importDetail[0].import.id === updateExportDetail.import.id) {
                                updateExportDetail.quantity = importDetail[0].quantity;
                                updateExportDetail.unitPrice = drug.price;
                                updateExportDetail.vat = drug.vat;
                                importDetail[0].quantity = 0

                                handledImportDetail.push(importDetail[0])
                                handledExportDetail.push(updateExportDetail)
                            }
                            else {
                                let newExportDetail = new ExportDetail()
                                newExportDetail.export = myExport;
                                newExportDetail.quantity = importDetail[0].quantity;
                                newExportDetail.unitPrice = drug.price;
                                newExportDetail.vat = drug.vat;
                                newExportDetail.drug = drug;
                                newExportDetail.import = importDetail[0].import;
                                importDetail[0].quantity = importDetail[0].quantity - differentQuantity

                                handledImportDetail.push(importDetail[0])
                                handledExportDetail.push(newExportDetail)
                            }
                            
                            let newExportDetail = new ExportDetail()
                            newExportDetail.export = myExport;
                            newExportDetail.quantity = left;
                            newExportDetail.unitPrice = drug.price;
                            newExportDetail.vat = drug.vat;
                            newExportDetail.drug = drug;
                            newExportDetail.import = importDetail[1].import;
                            importDetail[1].quantity = importDetail[1].quantity - left;

                            handledImportDetail.push(importDetail[1])
                            handledExportDetail.push(newExportDetail)
                        }
                    } else {
                        if (importDetail[0].import.id === updateExportDetail.import.id) {
                            updateExportDetail.quantity = exportDetail.quantity;
                            updateExportDetail.unitPrice = drug.price;
                            updateExportDetail.vat = drug.vat;
                            importDetail[0].quantity = importDetail[0].quantity + differentQuantity

                            handledImportDetail.push(importDetail[0])
                            handledExportDetail.push(updateExportDetail)
                        }
                        else {
                            let newExportDetail = new ExportDetail()
                            newExportDetail.export = myExport;
                            newExportDetail.quantity = +differentQuantity;
                            newExportDetail.unitPrice = drug.price;
                            newExportDetail.vat = drug.vat;
                            newExportDetail.drug = drug;
                            newExportDetail.import = importDetail[0].import;
                            importDetail[0].quantity = importDetail[0].quantity + differentQuantity

                            handledImportDetail.push(importDetail[0])
                            handledExportDetail.push(newExportDetail)
                        }
                    }
                }
                for (let exportDetail of newExportDetail) {
                    let drug: DrugCategory | undefined = drugs.find(
                        (drug: DrugCategory) => drug.id === exportDetail.drugId
                    );
                    const importDetail = await importDetailRepository.find({
                        where: {
                            drug: { id: exportDetail.drugId },
                            quantity: MoreThan(0)
                        },
                        order: {
                            import: {
                                importDate: 'ASC'
                            }
                        }
                    }) 
                    if (!drug) {
                        return reject({ errorMessage: 'Drug category not found' })
                    }
                    drug.quantity = drug.quantity - exportDetail.quantity;   
                    drugUpdate.push(drug); 

                    let left = importDetail[0].quantity - exportDetail.quantity

                    if (left >= 0) {
                        let newExportDetail = new ExportDetail();
                        newExportDetail.drug = drug
                        newExportDetail.export = myExport
                        newExportDetail.import = importDetail[0].import
                        newExportDetail.expiryDate = importDetail[0].expiryDate
                        newExportDetail.vat = drug.vat
                        newExportDetail.quantity = exportDetail.quantity
                        newExportDetail.unitPrice = drug.price
                        importDetail[0].quantity = importDetail[0].quantity - exportDetail.quantity

                        handledImportDetail.push(importDetail[0])
                        handledExportDetail.push(newExportDetail)
                    }
                    else {
                        let index: number = 0;

                        while (left < 0) {
                            let newExportDetail = new ExportDetail();
                            newExportDetail.drug = drug
                            newExportDetail.export = myExport
                            newExportDetail.import = importDetail[index].import
                            newExportDetail.expiryDate = importDetail[index].expiryDate
                            newExportDetail.quantity = importDetail[index].quantity
                            newExportDetail.vat = drug.vat
                            newExportDetail.unitPrice = drug.price
                            importDetail[index].quantity = 0

                            handledImportDetail.push(importDetail[index])
                            handledExportDetail.push(newExportDetail)

                            if (index + 1 < importDetail.length) break;
                            left = importDetail[++index].quantity + left
                        }

                        let newExportDetail = new ExportDetail();
                        newExportDetail.drug = drug
                        newExportDetail.export = myExport
                        newExportDetail.import = importDetail[0].import
                        newExportDetail.expiryDate = importDetail[0].expiryDate
                        newExportDetail.vat = drug.vat
                        newExportDetail.unitPrice = drug.price
                        newExportDetail.quantity = importDetail[0].quantity + left;
                        importDetail[index].quantity = left

                        handledImportDetail.push(importDetail[index])
                        handledExportDetail.push(newExportDetail)
                    }   
                }
                
                await transactionalEntityManager.getRepository(DrugCategory).save(drugUpdate)
                await transactionalEntityManager.getRepository(ImportDetail).save(handledImportDetail)
                await transactionalEntityManager.getRepository(ExportDetail).save(handledExportDetail)
                await exportRepository.save(myExport)
            })

            resolve({
                message: 'Update Export successfully',
                data: myExport
            })
        } catch (error) {
            reject(error)
        }
    })
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
    searchExport,
    storeExport,
    updateExport,
    deleteExport
}