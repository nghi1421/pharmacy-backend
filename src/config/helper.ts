import { ValidationError } from "class-validator"
import { QueryParam } from "../global/interfaces/QueryParam"
import { Repository } from "typeorm"
import { Request } from "express";
import { Meta } from "../global/interfaces/DataResponse";

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

export const dateBeforeTodayMessage = (c: string) => `${c} phải sau ngày hôm nay.`

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

export const getQueryParams = (req: Request): Promise<QueryParam> => {
    return new Promise((resolve, reject) => {
        try {
            let {
                page,
                perPage,
                searchTerm,
                searchColumns,
                orderBy,
                orderDirection
            } = req.query

            const queryParams: QueryParam = {
                page: parseInt(page as string),
                perPage: parseInt(perPage as string),
                searchTerm: searchTerm ? searchTerm as string : '',
                searchColumns: searchColumns ? (searchColumns as string)
                    .split(',')
                    .map((value) => value.trim()).filter((value) => value)
                    : [],
                orderBy: orderBy as string,
                orderDirection: ((orderDirection as 'asc' | 'desc').toUpperCase() as 'ASC' | 'DESC')
            }

            resolve(queryParams)
        }
        catch (error) {
            reject(error)
        }
    })
}

export const getMetaData = (queryParams: QueryParam, total: number): Promise<Meta> => {
    return new Promise((resolve, reject) => {
        try {
            const mod = total % queryParams.perPage;
            const pageNumber = Math.floor(total / queryParams.perPage);
         
            resolve({
                page: queryParams.page,
                perPage: queryParams.perPage,
                totalPage: mod === 0
                    ? pageNumber
                    : pageNumber + 1,
                total
            })
        }
        catch (error) {
            reject(error)
        }
    })
}