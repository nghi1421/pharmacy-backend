import { TypeByUse } from '../entity/TypeByUse'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { Like, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../utils/query';
import { QueryParam } from '../global/interfaces/QueryParam';
import { DataAndCount, getDataAndCount, getMetaData } from '../utils/helper';

const typeByUseRepository: Repository<TypeByUse> = AppDataSource.getRepository(TypeByUse);

const getTypeByUses = (queryParams: QueryParam | undefined): Promise<DataResponse<TypeByUse>> => {
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
                order[queryParams.orderBy] = queryParams.orderDirection

                const result: DataAndCount = await getDataAndCount(queryParams, typeByUseRepository, search, order);
        
                resolve({
                    message: 'Lấy thông tin phân loại công dụng thành công.',
                    data: result.data,
                    meta: await getMetaData(queryParams, result.total)
                })
            }
            else {
                const data: TypeByUse[] = await typeByUseRepository.find();
                resolve({
                    message: 'Lấy thông tin phân loại công dụng thành công.',
                    data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const getTypeByUse = (typeId: number): Promise<GetDataResponse<TypeByUse>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: TypeByUse|null = await typeByUseRepository.findOneBy({ id: typeId });
            if (result) {
                resolve({
                    message: 'Lấy thông tin phân loại công dụng thành công.',
                    data: result
                })
            }
            else {
                resolve({
                    errorMessage: 'Phân loại công dụng không tồn tại. Vui lòng làm mới trang.'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

const storeTypeByUse = (name: string, detail: string): Promise<DataOptionResponse<TypeByUse>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let newTypeByUse = new TypeByUse();

            newTypeByUse.name = name;
            newTypeByUse.detail = detail;

            const errors = await validate(newTypeByUse)
            if (errors.length > 0) {
                return reject({ validateError: errors });
            }
            
            const [{ exists }] = await checkExistUniqueCreate(typeByUseRepository, 'name', [name])
            
            if (exists) {
                return reject({
                    validateError: [{
                        key: 'name',
                        value: ['Tên phân loại công dụng đã tồn tại.']
                    }]
                })
            }
            
            await typeByUseRepository.save(newTypeByUse)
            resolve({
                message: 'Thêm phân loại công dụng thuốc thành công.',
                data: newTypeByUse
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateTypeByUse = (typeId: number, name: string, detail: string): Promise<DataOptionResponse<TypeByUse>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let typeByUse = await typeByUseRepository.findOneByOrFail({ id: typeId });

            typeByUse.name = name;
            typeByUse.detail = detail;

             const errors = await validate(typeByUse)
            if (errors.length > 0) {
                return reject({ validateError: errors });
            }
            
            const [{ exists }] = await checkExistUniqueUpdate(typeByUseRepository, 'name', [name, typeByUse.id])
            
            if (exists) {
                return reject({
                    validateError: [{
                        key: 'name',
                        value: ['Tên phân loại công dụng đã tồn tại.']
                    }]
                })
            }

            await typeByUseRepository.save(typeByUse)
            resolve({
                message: 'Cập nhật phân loại công dụng thuốc thành công.',
                data: typeByUse
            })
        } catch (error) {
            reject(error)
        }
    })
}

const deleteTypeByUse = (typeId: number): Promise<DataOptionResponse<TypeByUse>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let TypeByUse: TypeByUse = await typeByUseRepository.findOneByOrFail({ id: typeId });

            await typeByUseRepository.delete(typeId);

            resolve({
                message: 'Xóa phân loại công dụng thuốc thành công.',
                data: TypeByUse
            })
        } catch (error) {
            reject({ errorMessage: 'Phân loại công dụng đã thuộc danh mục thuốc. Không thể xóa phân loại công dụng này.'});
        }
    })
}

export default {
    getTypeByUses,
    getTypeByUse,
    storeTypeByUse,
    updateTypeByUse,
    deleteTypeByUse
}