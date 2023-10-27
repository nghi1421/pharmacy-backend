import { DrugCategory } from '../entity/DrugCategory'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { DrugCategoryData } from '../global/interfaces/DrugCategoryData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { TypeByUse } from '../entity/TypeByUse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';

const drugCategoryRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory);
const typeRepository: Repository<TypeByUse> = AppDataSource.getRepository(TypeByUse);

const getDrugCategories = (): Promise<DataResponse<DrugCategory>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const drugCategories = await drugCategoryRepository.find();
            resolve({
                message: 'Lấy thông tin danh mục thuốc thành công.',
                data: drugCategories
            })
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

const searchDrugCategory = (query: Object): Promise<DataResponse<DrugCategory>> => {
    return new Promise<DataResponse<DrugCategory>>(async (resolve, reject) => {
        try {
            const drugCategories = await drugCategoryRepository.find({ where: query});
            resolve({
                message: 'Lấy thông tin danh mục thuốc thành công.',
                data: drugCategories
            })
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
                return resolve({
                    errorMessage: 'Danh mục thuốc không tồn tại. Vui lòng làm mới trang.'
                });
            }

            newDrugCategory.name = data.name
            newDrugCategory.price = data.price
            newDrugCategory.unit = data.unit
            newDrugCategory.minimalUnit = data.minimalUnit
            newDrugCategory.quantity = 0
            newDrugCategory.form = data.form
            newDrugCategory.vat = data.vat
            newDrugCategory.quantityConversion = data.quantityConversion
            newDrugCategory.instruction = data.instruction
            newDrugCategory.preserved = data.preserved
            newDrugCategory.type = typeByUse

            const errors = await validate(newDrugCategory)
            
            if (errors.length > 0) {
                return resolve({ errorMessage: 'Thông tin danh mục thuốc không hợp lệ.'})
            }

            await drugCategoryRepository.save(newDrugCategory)
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
                return resolve({
                    errorMessage: 'Phân loại công dụng không tồn tại.'
                })
            }

            drugCategory.name = data.name
            drugCategory.price = data.price
            drugCategory.unit = data.unit
            drugCategory.minimalUnit = data.minimalUnit
            drugCategory.vat = data.vat
            drugCategory.form = data.form
            drugCategory.quantityConversion = data.quantityConversion
            drugCategory.instruction = data.instruction
            drugCategory.preserved = data.preserved
            drugCategory.type = typeByUse;
            
            const errors = await validate(drugCategory)
            if (errors.length > 0) {
                return resolve({ errorMessage: 'Thông tin danh mục thuốc không hợp lệ.'})
            }

            await drugCategoryRepository.save(drugCategory)
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
            reject(error);
        }
    })
}

export default {
    getDrugCategories,
    getDrugCategory,
    searchDrugCategory,
    storeDrugCategory,
    updateDrugCategory,
    deleteDrugCategory
}