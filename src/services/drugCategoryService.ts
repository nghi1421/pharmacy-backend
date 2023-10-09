import { DrugCategory } from '../entity/DrugCategory'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { DrugCategoryData } from '../global/interfaces/DrugCategoryData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { TypeByUse } from '../entity/TypeByUse';

const drugCategoryRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory);
const typeRepository: Repository<TypeByUse> = AppDataSource.getRepository(TypeByUse);

const getDrugCategories = (): Promise<DataResponse<DrugCategory>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const drugCategories = await drugCategoryRepository.find();
            resolve({
                message: 'Get drug categories successfully',
                data: drugCategories
            })
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
                message: 'Search drug categories successfully',
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
            const type = typeRepository.findOneBy({ id: data.typeId })
            
            if (type === null) {
                return reject({
                    errorMessge: 'Type by use not found'
                })
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

            const errors = await validate(newDrugCategory)
            
            if (errors.length > 0) {
                return reject({ errorMessage: 'Invalid information.'})
            }

            await drugCategoryRepository.save(newDrugCategory)
            resolve({
                message: 'Insert drug category successfully',
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
                return reject({
                    errorMessage: 'Drug category not found'
                })
            }

            const type = typeRepository.findOneBy({ id: data.typeId })
            
            if (type === null) {
                return reject({
                    errorMessge: 'Type by use not found'
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

            const errors = await validate(drugCategory)
            if (errors.length > 0) {
                return reject({ errorMessage: 'Invalid information.'})
            }

            await drugCategoryRepository.save(drugCategory)
            resolve({
                message: 'Drug category updated successfully',
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
                return reject({
                    errorMessage: 'Drug category not found'
                })
            }

            await drugCategoryRepository.delete(drugCategoryId);

            resolve({
                message: 'Drug category deleted successfully',
                data: drugCategory
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getDrugCategories,
    searchDrugCategory,
    storeDrugCategory,
    updateDrugCategory,
    deleteDrugCategory
}