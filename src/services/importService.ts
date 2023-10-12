import { Import } from '../entity/Import'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { UpdateImportData } from '../global/interfaces/UpdateImportData';
import { Staff } from '../entity/Staff';
import { Provider } from '../entity/Provider';
import { EntityManager, In, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { ImportDetail } from '../entity/ImportDetail';
import { NewImportDetailData, ExistsImportDetailData } from '../global/interfaces/ImportDetailData';
import { DrugCategory } from '../entity/DrugCategory';
import { calculateUnitPrice } from './calculationService'
import { ImportData } from '../global/interfaces/ImportData';

const importRepository: Repository<Import> = AppDataSource.getRepository(Import);
const importDetailRepository: Repository<ImportDetail> = AppDataSource.getRepository(ImportDetail);
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const providerRepository: Repository<Provider> = AppDataSource.getRepository(Provider);
const drugRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory);

const getImports = (): Promise<DataResponse<Import>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const imports = await importRepository.find();
            resolve({
                message: 'Get import successfully',
                data: imports
            })
        } catch (error) {
            reject(error);
        }
    })
}

const searchImport = (query: Object): Promise<DataResponse<Import>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const imports = await importRepository.find({ where: query});
            resolve({
                message: 'Search imports successfully',
                data: imports
            })
        } catch (error) {
            reject(error);
        }
    })
}

const storeImport = (data: ImportData): Promise<DataOptionResponse<Import>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const staff: Staff|null = await staffRepository.findOneBy({ id: data.staffId });
            if (staff === null) {
                return reject({ errorMessage: 'Staff not found.' });
            }

            const provider: Provider|null = await providerRepository.findOneBy({ id: data.providerId });
            if (provider === null) {
                return reject({ errorMessage: 'Provider not found.' });
            }

            let newImport = new Import();

            newImport.importDate = data.importDate;
            newImport.note = data.note;
            newImport.paid = data.paid;
            newImport.maturityDate = data.maturityDate;
            
            newImport.staff = staff;
            newImport.provider = provider;

            await validateOrReject(newImport)

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                
                await transactionalEntityManager.save(newImport)

                let drugIds: number[] = data.importDetails.map((importDetail: NewImportDetailData) => {
                    return importDetail.drugId
                })

                const drugs: DrugCategory[] = await drugRepository.find(
                    {
                        where: { id: In(drugIds) }
                    }
                );

                if (drugs.length === 0) {
                    return;
                }

                let handledImportDetail = []

                for (let importDetail of data.importDetails) {
                    let drug: DrugCategory | undefined = drugs.find(
                        (drug: DrugCategory) => drug.id === importDetail.drugId
                    );
                    if (!drug) {
                        reject({
                            errorMessage: 'Drug category not found',
                        })
                        return; 
                    }
                    const quantity: number = drug.quantityConversion * importDetail.quantityImport
                    drug.price = calculateUnitPrice(importDetail.unitPrice, drug.quantityConversion);
                    drug.addQuantityFromImport(quantity);
                    await transactionalEntityManager.save(drug);

                    handledImportDetail.push({
                        ...importDetail,
                        drug: drug,
                        import: newImport,
                        vat: drug.vat,
                        quantity: quantity,
                    })
                }

                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(ImportDetail)
                    .values(handledImportDetail)
                    .execute()
            })
            
            resolve({
                message: 'Insert Import successfully',
                data: newImport
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateImport = (
    importId: number,
    data: UpdateImportData,
    newImportDetail: NewImportDetailData[],
    existsImportDetail: ExistsImportDetailData[],
)
    : Promise<DataOptionResponse<Import>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let myImport: Import = await importRepository.findOneByOrFail({ id: importId });

            const provider: Provider|null = await providerRepository.findOneBy({ id: data.providerId });
            if (provider === null) {
                return reject({ errorMessage: 'Provider not found' });
            }

            myImport.importDate = data.importDate;
            myImport.note = data.note;
            myImport.paid = data.paid;
            myImport.maturityDate = data.maturityDate;

            await validateOrReject(myImport)

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                await transactionalEntityManager.save(myImport)

                const importDetailIds: number[] =
                    existsImportDetail.map(
                        (existsImportDetail) => existsImportDetail.id
                    )
                await transactionalEntityManager
                    .createQueryBuilder()
                    .delete()
                    .from(ImportDetail)
                    .where('id NOT IN(:id)', {
                        id: importDetailIds,
                    })
                    .execute();
                
                let drugIds: number[] = newImportDetail.map((importDetail: NewImportDetailData) => {
                    return importDetail.drugId
                })

                drugIds = drugIds.concat(existsImportDetail.map((importDetail: ExistsImportDetailData) => {
                    return importDetail.drugId
                }))

                const drugs: DrugCategory[] = await drugRepository.find(
                    {
                        where: { id: In(drugIds) }
                    }
                );

                if (drugs.length === 0) {
                    reject({
                        errorMessage: 'Import requires import details'
                    })
                    return;
                }

                for (let importDetail of existsImportDetail) {
                    let drug: DrugCategory | undefined = drugs.find(
                        (drug: DrugCategory) => drug.id === importDetail.drugId
                    );
                    if (!drug) {
                        reject({
                            errorMessage: 'Drug category not found',
                        })
                        return; 
                    }
                    const quantity: number = drug.quantityConversion * importDetail.quantityImport
                    drug.price = calculateUnitPrice(importDetail.unitPrice, drug.quantityConversion);
                    const result: boolean =
                        drug.updateQuantityFromImportModify(
                            importDetail.oldQuantityImport,
                            importDetail.quantityImport
                        )
                    if (!result) {
                        reject({
                            errorMessage: 'Drug category imported, that was been sold more than new update.',
                        })
                        return; 
                    }
                    await transactionalEntityManager.save(drug);

                    await transactionalEntityManager
                        .createQueryBuilder()
                        .update(ImportDetail)
                        .set({
                            quantity: quantity,
                            expiryDate: importDetail.expiryDate,
                            batchId: importDetail.batchId,
                            quantityImport: importDetail.quantityImport,
                        })
                        .where("id = :id", {id: importDetail.id})
                        .execute()
                }

                let handledNewImportDetail = []
                for (let importDetail of newImportDetail) {
                    let drug: DrugCategory | undefined = drugs.find(
                        (drug: DrugCategory) => drug.id === importDetail.drugId
                    );
                    if (!drug) {
                        reject({
                            errorMessage: 'Drug category not found',
                        })
                        return; 
                    }
                    const quantity: number = drug.quantityConversion * importDetail.quantityImport
                    drug.price = calculateUnitPrice(importDetail.unitPrice, drug.quantityConversion);
                    drug.addQuantityFromImport(quantity);
                    await transactionalEntityManager.save(drug);

                    handledNewImportDetail.push({
                        ...importDetail,
                        drug: drug,
                        import: myImport,
                        vat: drug.vat,
                        quantity: quantity,
                    })
                }

                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(ImportDetail)
                    .values(handledNewImportDetail)
                    .execute()
            })

            await importRepository.save(myImport)
            resolve({
                message: 'Update Import successfully',
                data: myImport
            })
        } catch (error) {
            reject(error)
        }
    })
}

const deleteImport = (importId: number): Promise<DataOptionResponse<Import>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let myImport: Import = await importRepository.findOneByOrFail({ id: importId });

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                const importDetailIds = await importDetailRepository.find({
                    where: {
                        import: { 
                            id: myImport.id,
                        },
                    },
                    select: {id: true}
                })

                await transactionalEntityManager
                    .createQueryBuilder()
                    .delete()
                    .from(ImportDetail)
                    .where('id IN (:ids)', importDetailIds)
                    .execute()

                await transactionalEntityManager.getRepository(Import).delete(importId);
            })

            resolve({
                message: 'Import deleted successfully',
                data: myImport
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getImports,
    searchImport,
    storeImport,
    updateImport,
    deleteImport
}