import { DrugCategory } from '../entity/DrugCategory'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { DrugCategoryData } from '../global/interfaces/DrugCategoryData';
import { Like, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { TypeByUse } from '../entity/TypeByUse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../utils/query';
import { QueryParam } from '../global/interfaces/QueryParam';
import { DataAndCount, getDataAndCount, getMetaData } from '../utils/helper';
import drugCategoryCache from '../cache/DrugCategoryCache'
import { Inventory } from '../entity/Inventory';
import inventoryService from './inventoryService';
    
const drugCategoryRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory);
const typeRepository: Repository<TypeByUse> = AppDataSource.getRepository(TypeByUse);

const getDrugCategories = (queryParams: QueryParam | undefined): Promise<DataResponse<DrugCategory>> => {
    return new Promise(async (resolve, reject) => {
        try {
            if (queryParams) {
                const search = queryParams.searchColumns.map((param) => {
                    const object: any = {}
                    if (param === 'id') {
                        object[param] = queryParams.searchTerm
                    }
                    else {
                        object[param] = Like(`%${queryParams.searchTerm}%`)
                    }
                    return object
                })
                
                const order: any = {}
                switch (queryParams.orderBy) {
                    case 'use': {
                        order['type'] = { id: queryParams.orderDirection }
                        break;
                    }
                    
                    case 'formatedPrice': {
                        order['price'] = queryParams.orderDirection
                        break;
                    }
                
                    default: {
                        order[queryParams.orderBy] = queryParams.orderDirection
                    }
                }

                const result: DataAndCount = await getDataAndCount(queryParams, drugCategoryRepository, search, order);
                const getInventory = async () => Promise.all(result.data.map(async (drugCategory: DrugCategory) => {
                    let drugInventory: Inventory | null = await inventoryService.getDrugInventory(drugCategory.id)
                    return {...drugCategory, quantity: drugInventory ? drugInventory.inventoryQuantiy : 0} as DrugCategory
                }))
                const drugCategories = await getInventory()
                resolve({
                    message: 'Lấy thông tin danh mục thuốc thành công.',
                    data: drugCategories,
                    meta: await getMetaData(queryParams, result.total),
                })
            }
            else {      
                const drugCategoriesCache: DrugCategory[] | undefined | null
                    = drugCategoryCache.getDrugCategories();

                if (!drugCategoriesCache) {
                    const data: DrugCategory[] = await drugCategoryRepository.find();
                    const getInventory = async () => Promise.all(data.map(async (drugCategory) => {
                        let drugInventory: Inventory | null = await inventoryService.getDrugInventory(drugCategory.id)
                        return {...drugCategory, quantity: drugInventory ? drugInventory.inventoryQuantiy : 0} as DrugCategory
                    }))
                    const drugCategories = await getInventory()

                    drugCategoryCache.setDrugCategories(drugCategories)
                    resolve({
                        message: 'Lấy thông tin danh mục thuốc thành công.',
                        data: data,
                    })    
                }
                else {
                    resolve({
                        message: 'Lấy thông tin danh mục thuốc thành công.',
                        data: drugCategoriesCache,
                    })    
                }
            }
            
        } catch (error) {
            reject(error);
        }
    })
}

const getDrugCategory = (drugId: number): Promise<GetDataResponse<DrugCategory>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: DrugCategory|null = await drugCategoryRepository.findOneBy({ id: drugId });
            if (result) {
                resolve({
                    message: 'Lấy thông tin danh mục thuốc thành công.',
                    data: result
                })
            }
            else {
                resolve({
                    errorMessage: 'Danh mục thuốc không tồn tại. Vui lòng làm mới trang.'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

const storeDrugCategory = (data: DrugCategoryData): Promise<DataOptionResponse<DrugCategory>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let newDrugCategory = new DrugCategory();
            const typeByUse: TypeByUse | null = await typeRepository.findOneBy({ id: data.typeId })
            
            if (!typeByUse) {
                return reject({
                    errorMessage: 'Danh mục thuốc không tồn tại. Vui lòng làm mới trang.'
                });
            }

            newDrugCategory.name = data.name
            newDrugCategory.price = data.price
            newDrugCategory.unit = data.unit
            newDrugCategory.minimalUnit = data.minimalUnit
            newDrugCategory.form = data.form
            newDrugCategory.vat = data.vat
            newDrugCategory.conversionQuantity = data.conversionQuantity
            newDrugCategory.instruction = data.instruction
            newDrugCategory.preserved = data.preserved
            newDrugCategory.type = typeByUse

            const errors = await validate(newDrugCategory)
            if (errors.length > 0) {
                return reject({ validateError: errors });
            }
            
            const [{ exists }] = await checkExistUniqueCreate(drugCategoryRepository, 'name', [newDrugCategory.name])
            
            if (exists) {
                return reject({
                    validateError: [{
                        key: 'name',
                        value: ['Tên danh mục thuốc đã tồn tại.']
                    }]
                })
            }

            await drugCategoryRepository.save(newDrugCategory)

            drugCategoryCache.setDrugCategories(null)
            resolve({
                message: 'Thêm thông tin danh mục thuốc thành công.',
                data: newDrugCategory
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateDrugCategory =
    (drugCategoryId: number, data: DrugCategoryData): Promise<DataOptionResponse<DrugCategory>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let drugCategory: DrugCategory|null = await drugCategoryRepository.findOneBy({ id: drugCategoryId });

            if (drugCategory === null) {
                return resolve({
                    errorMessage: 'Danh mục thuốc không tồn tại. Vui lòng làm mới trang.'
                });
            }

            const typeByUse: TypeByUse|null = await typeRepository.findOneBy({ id: data.typeId })
            
            if (typeByUse === null) {
                return reject({
                    errorMessage: 'Phân loại công dụng không tồn tại.'
                })
            }

            drugCategory.name = data.name
            drugCategory.price = data.price
            drugCategory.unit = data.unit
            drugCategory.minimalUnit = data.minimalUnit
            drugCategory.vat = data.vat
            drugCategory.form = data.form
            drugCategory.conversionQuantity = data.conversionQuantity
            drugCategory.instruction = data.instruction
            drugCategory.preserved = data.preserved
            drugCategory.type = typeByUse;
            
            const errors = await validate(drugCategory)
            if (errors.length > 0) {
                return reject({ validateError: errors });
            }
            
            const [{ exists }] = await checkExistUniqueUpdate(drugCategoryRepository, 'name', [drugCategory.name, drugCategory.id])
            
            if (exists) {
                return reject({
                    validateError: [{
                        key: 'name',
                        value: ['Tên danh mục thuốc đã tồn tại.']
                    }]
                })
            }

            await drugCategoryRepository.save(drugCategory)
            drugCategoryCache.setDrugCategories(null)
            resolve({
                message: 'Cập nhật thông tin danh mục thuốc thành công.',
                data: drugCategory
            })
        } catch (error) {
            reject(error)
        }
    })
}

const deleteDrugCategory = (drugCategoryId: number): Promise<DataOptionResponse<DrugCategory>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let drugCategory: DrugCategory|null = await drugCategoryRepository.findOneBy({ id: drugCategoryId });

            if (drugCategory === null) {
                return resolve({
                    errorMessage: 'Danh mục thuốc không tồn tại. Vui lòng làm mới trang.'
                });
            }

            await drugCategoryRepository.delete(drugCategoryId);
            resolve({
                message: 'Xóa thông tin danh mục thuốc thành công.',
                data: drugCategory
            })
        } catch (error) {
            reject({ errorMessage: 'Danh mục thuốc đã được dùng. Không thể xóa thông tin danh mục thuốc này.'});
        }
    })
}

export default {
    getDrugCategories,
    getDrugCategory,
    storeDrugCategory,
    updateDrugCategory,
    deleteDrugCategory
}