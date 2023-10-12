import { Export } from '../entity/Export'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { Staff } from '../entity/Staff';
import { EntityManager, In, MoreThan, Repository } from 'typeorm';
import { ImportDetail } from '../entity/ImportDetail';
import { DrugCategory } from '../entity/DrugCategory';
import { ExportData } from '../global/interfaces/ExportData';
import { ExportDetail } from '../entity/ExportDetail';
import { Customer } from '../entity/Customer';

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

                let handledImportDetail = []

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

                        handledImportDetail.push({
                            ...exportDetail,
                            drug: drug,
                            export: myExport,
                            import: importDetail[0],
                            vat: drug.vat,
                        })
                    }
                    else {
                        
                        handledImportDetail.push({
                            ...exportDetail,
                            drug: drug,
                            export: myExport,
                            import: importDetail[0],
                            vat: drug.vat,
                            quantity: importDetail[0].quantity
                        })
                        handledImportDetail.push({
                            ...exportDetail,
                            drug: drug,
                            export: myExport,
                            import: importDetail[1],
                            vat: drug.vat,
                            quantity: -quantity
                        })
                        importDetail[0].quantity = 0
                        await transactionalEntityManager.save(importDetail[0])
                        importDetail[1].quantity = importDetail[1].quantity + quantity
                        await transactionalEntityManager.save(importDetail[1])
                    }        
                }

                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(ImportDetail)
                    .values(handledImportDetail)
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

// const updateImport = (
//     importId: number,
//     data: UpdateExportData,
//     newImportDetail: NewImportDetailData[],
//     existsImportDetail: ExistsImportDetailData[],
// )
//     : Promise<DataOptionResponse<Import>> => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let myImport: Import = await exportRepository.findOneByOrFail({ id: importId });

//             const provider: Provider|null = await customerRepository.findOneBy({ id: data.providerId });
//             if (provider === null) {
//                 return reject({ errorMessage: 'Provider not found' });
//             }

//             myImport.importDate = data.importDate;
//             myImport.note = data.note;
//             myImport.paid = data.paid;
//             myImport.maturityDate = data.maturityDate;

//             await validateOrReject(myImport)

//             await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
//                 await transactionalEntityManager.save(myImport)

//                 const importDetailIds: number[] =
//                     existsImportDetail.map(
//                         (existsImportDetail) => existsImportDetail.id
//                     )
                
//                 //Update remove method here
                
//                 await transactionalEntityManager
//                     .createQueryBuilder()
//                     .delete()
//                     .from(ImportDetail)
//                     .where('id NOT IN(:id)', {
//                         id: importDetailIds,
//                     })
//                     .execute();
                
//                 let drugIds: number[] = newImportDetail.map((importDetail: NewImportDetailData) => {
//                     return importDetail.drugId
//                 })

//                 drugIds = drugIds.concat(existsImportDetail.map((importDetail: ExistsImportDetailData) => {
//                     return importDetail.drugId
//                 }))

//                 const drugs: DrugCategory[] = await drugRepository.find(
//                     {
//                         where: { id: In(drugIds) }
//                     }
//                 );

//                 if (drugs.length === 0) {
//                     reject({
//                         errorMessage: 'Import requires import details'
//                     })
//                     return;
//                 }

//                 for (let importDetail of existsImportDetail) {
//                     let drug: DrugCategory | undefined = drugs.find(
//                         (drug: DrugCategory) => drug.id === importDetail.drugId
//                     );
//                     if (!drug) {
//                         reject({
//                             errorMessage: 'Drug category not found',
//                         })
//                         return; 
//                     }
//                     const quantity: number = drug.quantityConversion * importDetail.quantityImport
//                     drug.price = calculateUnitPrice(importDetail.unitPrice, drug.quantityConversion);
//                     const result: boolean =
//                         drug.updateQuantityFromImportModify(
//                             importDetail.oldQuantityImport,
//                             importDetail.quantityImport
//                         )
//                     if (!result) {
//                         reject({
//                             errorMessage: 'Drug category imported, that was been sold more than new update.',
//                         })
//                         return; 
//                     }
//                     await transactionalEntityManager.save(drug);

//                     await transactionalEntityManager
//                         .createQueryBuilder()
//                         .update(ImportDetail)
//                         .set({
//                             quantity: quantity,
//                             expiryDate: importDetail.expiryDate,
//                             batchId: importDetail.batchId,
//                             quantityImport: importDetail.quantityImport,
//                         })
//                         .where("id = :id", {id: importDetail.id})
//                         .execute()
//                 }

//                 let handledNewImportDetail = []
//                 for (let importDetail of newImportDetail) {
//                     let drug: DrugCategory | undefined = drugs.find(
//                         (drug: DrugCategory) => drug.id === importDetail.drugId
//                     );
//                     if (!drug) {
//                         reject({
//                             errorMessage: 'Drug category not found',
//                         })
//                         return; 
//                     }
//                     const quantity: number = drug.quantityConversion * importDetail.quantityImport
//                     drug.price = calculateUnitPrice(importDetail.unitPrice, drug.quantityConversion);
//                     drug.addQuantityFromImport(quantity);
//                     await transactionalEntityManager.save(drug);

//                     handledNewImportDetail.push({
//                         ...importDetail,
//                         drug: drug,
//                         import: myImport,
//                         vat: drug.vat,
//                         quantity: quantity,
//                     })
//                 }

//                 await transactionalEntityManager
//                     .createQueryBuilder()
//                     .insert()
//                     .into(ImportDetail)
//                     .values(handledNewImportDetail)
//                     .execute()
//             })

//             await exportRepository.save(myImport)
//             resolve({
//                 message: 'Update Import successfully',
//                 data: myImport
//             })
//         } catch (error) {
//             reject(error)
//         }
//     })
// }

// const deleteImport = (importId: number): Promise<DataOptionResponse<Import>> => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let myImport: Import = await exportRepository.findOneByOrFail({ id: importId });

//             await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
//                 const importDetail = await exportDetailRepository.find({
//                     where: {
//                         import: { 
//                             id: myImport.id,
//                         },
//                     },
//                 })
            
//                 await transactionalEntityManager.getRepository(ImportDetail).remove(importDetail);

//                 await transactionalEntityManager.getRepository(Import).delete(importId);
//             })

//             resolve({
//                 message: 'Import deleted successfully',
//                 data: myImport
//             })
//         } catch (error) {
//             reject(error);
//         }
//     })
// }

export default {
    getExports,
    searchExport,
    storeExport,
    // updateImport,
    // deleteImport
}