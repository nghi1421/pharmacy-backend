import { Import } from '../entity/Import'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { Staff } from '../entity/Staff';
import { Provider } from '../entity/Provider';
import { EntityManager, In, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { ImportDetail } from '../entity/ImportDetail';
import { NewImportDetailData } from '../global/interfaces/ImportDetailData';
import { DrugCategory } from '../entity/DrugCategory';
import { calculateUnitPrice } from './calculationService'
import { ImportData } from '../global/interfaces/ImportData';
import { getErrors } from '../config/helper';

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
            const staff: Staff | null = await staffRepository.findOneBy({ id: data.staffId });
            if (!staff) {
                return resolve({ errorMessage: 'Thông tin nhân viên không tồn tại.' });
            }
            const provider: Provider | null = await providerRepository.findOneBy({ id: data.providerId })
            if (!provider) {
                return resolve({ errorMessage: 'Thông tin công ti dược không tồn tại.' });
            }
            let newImport = new Import();
            newImport.provider = provider;
            newImport.staff = staff;
            newImport.note = data.note;
            newImport.maturityDate = data.maturityDate;
            newImport.paid = data.paid;
            newImport.importDate = data.importDate;

            const errors = await validate(newImport);
            if (errors.length > 0) {
                return reject({ validateError: getErrors(errors) });
            }
            
            let drugIds: number[] = data.importDetails.map((importDetail: NewImportDetailData) => importDetail.drugId)
            const drugCategories: DrugCategory[] = await drugRepository.find({ where: { id: In(drugIds) } });
            if (drugCategories.length == 0) {
                return resolve({ errorMessage: 'Vui lòng chọn danh mục thuốc.'})
            }

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                await transactionalEntityManager.save(newImport)

                for (let importDetail of data.importDetails) {
                    let drug: DrugCategory | undefined = drugCategories.find(
                        (drug: DrugCategory) => drug.id === importDetail.drugId
                    );
                    const newImportDetail = new ImportDetail()
                    if (!drug) {
                        resolve({
                            errorMessage: `Mã thuốc ${importDetail.drugId} không tồn. Vui lòng làm mới danh mục thuốc để cập nhật thông tin.`,
                        }); 
                        throw new Error();
                    }
                    drug.price = calculateUnitPrice(importDetail.unitPrice, drug.conversionQuantity);
                    await transactionalEntityManager.save(drug);

                    newImportDetail.import = newImport
                    newImportDetail.drug = drug
                    newImportDetail.batchId = importDetail.batchId
                    newImportDetail.unitPrice = importDetail.unitPrice
                    newImportDetail.quantity = importDetail.quantity
                    newImportDetail.vat = drug.vat
                    newImportDetail.conversionQuantity = drug.conversionQuantity
                    newImportDetail.expiryDate = new Date(importDetail.expiryDate)
                    
                    const errors = await validate(newImportDetail)
                    if (errors.length > 0) {
                        reject({ validateError: getErrors(errors) })
                        throw new Error();
                    }
                    await transactionalEntityManager.save(newImportDetail);
                }
            })
            resolve({
                message: 'Thêm thông tin phiếu nhập thuốc thành công.',
                data: newImport
            })
        }
        catch (error) {
            reject(error);
        }
    })
}

const updateImport = () => {

}

const deleteImport = (importId: number): Promise<DataOptionResponse<Import>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let myImport: Import = await importRepository.findOneByOrFail({ id: importId });

            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                const importDetail = await importDetailRepository.find({
                    where: {
                        import: { 
                            id: myImport.id,
                        },
                    },
                })
            
                await transactionalEntityManager.getRepository(ImportDetail).remove(importDetail);

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