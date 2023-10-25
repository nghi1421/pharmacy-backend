import { TypeByUse } from '../entity/TypeByUse'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';

const TypeByUseRepository: Repository<TypeByUse> = AppDataSource.getRepository(TypeByUse);

const getTypeByUses = (): Promise<DataResponse<TypeByUse>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const types: TypeByUse[] = await TypeByUseRepository.find();
            resolve({
                message: 'Get type by uses successfully',
                data: types
            })
        } catch (error) {
            reject(error);
        }
    })
}

const getTypeByUse = (typeId: number): Promise<GetDataResponse<TypeByUse>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: TypeByUse|null = await TypeByUseRepository.findOneBy({ id: typeId });
            if (result) {
                resolve({
                    message: 'Lấy thông tin phân loại công dụng thành công.',
                    data: result
                })
            }
            else {
                reject({
                    errorMessage: 'Phân loại công dụng không tồn tại. Vui lòng làm mới trang.'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

const searchTypeByUse = (query: Object): Promise<DataResponse<TypeByUse>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const types: TypeByUse[] = await TypeByUseRepository.find({ where: query});
            resolve({
                message: 'type by uses successfully',
                data: types
            })
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

            await validateOrReject(newTypeByUse)
            
            await TypeByUseRepository.save(newTypeByUse)
            resolve({
                message: 'Insert type by use successfully',
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
            let typeByUse = await TypeByUseRepository.findOneByOrFail({ id: typeId });

            typeByUse.name = name;
            typeByUse.detail = detail;

            await validateOrReject(typeByUse)

            await TypeByUseRepository.save(typeByUse)
            resolve({
                message: 'Update type by use successfully',
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
            let TypeByUse: TypeByUse = await TypeByUseRepository.findOneByOrFail({ id: typeId });

            await TypeByUseRepository.delete(typeId);

            resolve({
                message: 'Type by use deleted successfully',
                data: TypeByUse
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getTypeByUses,
    getTypeByUse,
    searchTypeByUse,
    storeTypeByUse,
    updateTypeByUse,
    deleteTypeByUse
}