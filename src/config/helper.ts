import { ValidationError } from "class-validator"
import { QueryParam } from "../global/interfaces/QueryParam"
import { Repository } from "typeorm"

export interface DataAndCount {
    data: any;
    total: number
}

export const maxLengthErrorMessage =   (c: string, n: number) => `${c} tối đa ${n} kí tự.`

export const typeInvalidMessage =  (c: string) => `${c} không hợp lệ.`

export const numberInvalidMesssage = (c: string) => `${c} phải là số.`

export const requiredMessage = (c: string) => `${c} bắt buộc.`

export const numberMinMesssage = (c: string, n: number) => `Giá trị ${c} phải lớn hơn ${n}.`

export const numberMaxMesssage = (c: string, n: number) => `Giá trị ${c} phải nhỏ hơn ${n}.`

export const phoneNumberRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/

export const stringOnlyNumberRegex = /^\d+$/

export const getErrors = (errors: ValidationError[]) => {
    return errors.map((error: ValidationError) => {
        const key = error.property
        let value
        if (error.constraints) {
            value = Object.values(error.constraints)
        }
        return {key, value}
    })
}

export const getDataAndCount = async (
    queryParams: QueryParam,
    repository: Repository<any>,
    search: {[key: string]: string}[],
    order: {[key: string]: string
}): Promise<DataAndCount> => {
    let result, total
    return new Promise(async (resolve, reject) => {
         try {
            if (queryParams.searchColumns.length !== 0 && queryParams.searchTerm.length !== 0) {
                [result, total] = await repository.findAndCount({
                    where: search,
                    take: queryParams.perPage,
                    skip: ((queryParams.page - 1) * queryParams.perPage),
                    order   
                })
            }
            else {
                [result, total] = await repository.findAndCount({
                    take: queryParams.perPage,
                    skip: ((queryParams.page - 1) * queryParams.perPage),
                    order
                })
            }      
            resolve({
                data: result,
                total
            })  
        }
        catch (error) {
            reject({
                error
            })
        }   
    })
}