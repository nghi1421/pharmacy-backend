import { DrugCategory } from '../entity/DrugCategory'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { DrugCategoryData } from '../global/interfaces/DrugCategoryData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';

const drugCategoryRepository: Repository<DrugCategory> = AppDataSource.getRepository(DrugCategory);

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
            const staff = await drugCategoryRepository.find({ where: query});
            resolve({
                message: 'Search DrugCategorys successfully',
                data: staff
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

            newDrugCategory.name = data.name
            newDrugCategory.unit = data.unit
            newDrugCategory.price = data.price
            newDrugCategory.quantity = data.quantity
            newDrugCategory.quantityConversion = data.quantityConversion
            newDrugCategory.type = data.type
            newDrugCategory.uses = data.uses
            newDrugCategory.instruction = data.instruction

            const errors = await validate(newDrugCategory)
            
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
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
            let drugCategory = await drugCategoryRepository.findOneByOrFail({ id: drugCategoryId });

            drugCategory.name = data.name
            drugCategory.unit = data.unit
            drugCategory.price = data.price
            drugCategory.quantity = data.quantity
            drugCategory.quantityConversion = data.quantityConversion
            drugCategory.type = data.type
            drugCategory.uses = data.uses
            drugCategory.instruction = data.instruction

            const errors = await validate(drugCategory)
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
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
            let drugCategory: DrugCategory = await drugCategoryRepository.findOneByOrFail({ id: drugCategoryId });

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