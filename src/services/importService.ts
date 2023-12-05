import { Import } from '../entity/Import'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { Staff } from '../entity/Staff';
import { Provider } from '../entity/Provider';
import { EntityManager, In, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { ImportDetail } from '../entity/ImportDetail';
import { NewImportDetailData } from '../global/interfaces/ImportDetailData';
import { DrugCategory } from '../entity/DrugCategory';
import { calculateUnitPrice } from './calculationService'
import { ImportData } from '../global/interfaces/ImportData';
import { DataAndCount, getDataAndCount, getErrors, getMetaData } from '../utils/helper';
import drugCategoryCache from '../cache/DrugCategoryCache';
import { QueryParam } from '../global/interfaces/QueryParam';

const importRepository: Repository<Import> = AppDataSource.getRepository(Import);
const importDetailRepository: Repository<ImportDetail> = AppDataSource.getRepository(ImportDetail);
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const providerRepository: Repository<Provider> = AppDataSource.getRepository(Provider);
const drugRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory);

const getImports = (queryParams: QueryParam): Promise<DataResponse<Import>> => {
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

                const result: DataAndCount = await getDataAndCount(queryParams, importRepository, search, order);
        
                resolve({
                    message: 'Lấy thông tin phiếu nhập hàng thành công.',
                    data: result.data,
                    meta: await getMetaData(queryParams, result.total)
                })    
            }
            else {
                const data: Import[] = await importRepository.find();

                resolve({
                    message: 'Lấy thông tin phiếu nhập hàng thành công.',
                    data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const getImport = (importId: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const importData: null | Import = await importRepository.findOneBy({ id: importId});
            if (importData) {
                const importDetails = await importDetailRepository.find({ where: { import: { id: importData.id } } })
                const resultDetailData = []
                let totalPrice: number = 0;
                let totalPriceWithVat: number = 0;
                for (let importDetail of importDetails) {
                    const price = importDetail.unitPrice * importDetail.quantity
                    const priceWithVat = importDetail.unitPrice * importDetail.quantity * (1 + importDetail.vat)

                    resultDetailData.push({
                            ...importDetail,
                        })
                    
                    totalPrice += price
                    totalPriceWithVat += priceWithVat
                }
                resolve({
                    message: 'Lấy thông tin phiếu nhập hàng thành công.',
                    data: {
                        import: {
                            ...importData,
                             totalPriceWithVat,
                             totalPrice: totalPrice,
                            vatValue: totalPriceWithVat - totalPrice
                        },
                        importDetail: resultDetailData
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

const getImportDetailsAfter = (drugId: number, importDetailId: number): Promise<ImportDetail[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const importDetails: ImportDetail[] = await importDetailRepository.find({
                where: {
                    drug: { id: drugId },
                    id: MoreThanOrEqual(importDetailId)
                },
                order: {
                    id: 'ASC'
                }
            })

            resolve(importDetails);
        }
        catch (error) {
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

            const lastestImport: Import | null = await importRepository.findOne({ order: { importDate: 'DESC' } })
            
            if (lastestImport) {
                if (lastestImport.importDate > data.importDate) {
                    return reject({ errorMesssgae: 'Đơn hàng nhập phải được nhập sau đơn hàng nhập gần nhất.'})
                }
            }
            let newImport = new Import();
            newImport.provider = provider;
            newImport.staff = staff;
            newImport.note = data.note;
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
                            errorMessage: `Mã thuốc ${importDetail.drugId} không tồn tại. Vui lòng làm mới danh mục thuốc để cập nhật thông tin.`,
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
            drugCategoryCache.setDrugCategories(null)
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
    getImport,
    searchImport,
    getImportDetailsAfter,
    storeImport,
    updateImport,
    deleteImport
}