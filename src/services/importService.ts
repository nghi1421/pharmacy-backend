import { Import } from '../entity/Import'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { ImportData } from '../global/interfaces/ImportData';
import { Staff } from '../entity/Staff';
import { Provider } from '../entity/Provider';
import { EntityManager, In, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { ImportDetail } from '../entity/ImportDetail';
import { ImportDetailData } from '../global/interfaces/ImportDetailData';
import { DrugCategory } from '../entity/DrugCategory';
import { calculateUnitPrice } from './calculationService'

const importRepository: Repository<Import> = AppDataSource.getRepository(Import);
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

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                await validateOrReject(newImport)
                await transactionalEntityManager.save(newImport)

                let drugIds: number[] = data.importDetails.map((importDetail: ImportDetailData) => {
                    return importDetail.drugId
                })

                const drugs: DrugCategory[] = await drugRepository.find(
                    {
                        where: { id: In(drugIds) }
                    }
                );

                let importDetail = data.importDetails.map((importDetail: ImportDetailData) => {
                    let drug: DrugCategory | undefined = drugs.find(
                        (drug: DrugCategory) => drug.id === importDetail.drugId
                    );
                    if (!drug) {
                        reject({ errorMessage: 'Drug category not found' });
                        return;
                    }
                    drug.price = calculateUnitPrice(importDetail.unitPrice);

                    transactionalEntityManager.save(drug);

                    return {
                        ...importDetail,
                        importId: newImport.id,
                        vat: drug.vat,
                        quantity: drug.quantityConversion * importDetail.amountImport,
                    };
                })
                
                console.log(importDetail);
                throw new Error('123');
                // if (!importDetail) {
                //     throw new Error('Missing import detail.')
                // }

                // await transactionalEntityManager
                //     .createQueryBuilder()
                //     .insert()
                //     .into(ImportDetail)
                //     .values(importDetail)
                //add detail
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

const updateImport = (importId: number, data: ImportData): Promise<DataOptionResponse<Import>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let myImport = await importRepository.findOneByOrFail({ id: importId });

            const provider: Provider|null = await providerRepository.findOneBy({ id: data.providerId });
            if (provider === null) {
                return reject({ errorMessage: 'Provider not found' });
            }

            myImport.importDate = data.importDate;
            myImport.note = data.note;
            myImport.paid = data.paid;
            myImport.maturityDate = data.maturityDate;
            
            myImport.provider = provider;

            await validateOrReject(myImport)

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

            await importRepository.delete(importId);

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