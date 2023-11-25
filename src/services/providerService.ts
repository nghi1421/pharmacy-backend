import { Provider } from '../entity/Provider'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { ProviderData } from '../global/interfaces/ProviderData';
import { Like, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../utils/query';
import { QueryParam } from '../global/interfaces/QueryParam';
import { DataAndCount, getDataAndCount, getMetaData } from '../utils/helper';

const providerRepository: Repository<Provider> = AppDataSource.getRepository(Provider);

const getProviders = (queryParams: QueryParam | undefined): Promise<DataResponse<Provider>> => {
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

                const result: DataAndCount = await getDataAndCount(queryParams, providerRepository, search, order);
        
                resolve({
                    message: 'Lấy thông tin công ty dược thành công.',
                    data: result.data,
                    meta: await getMetaData(queryParams, result.total)
                })
            }
            else {
                const data: Provider[] = await providerRepository.find();
                resolve({
                    message: 'Lấy thông tin công ty dược thành công.',
                    data: data
                })
            }
        } catch (error) { 
            reject(error);
        }
    })
}

const getProvider = (providerId: number): Promise<GetDataResponse<Provider>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: Provider|null = await providerRepository.findOneBy({ id: providerId });
            if (result) {
                resolve({
                    message: 'Lấy thông tin công ty dược thành công.',
                    data: result
                })
            }
            else {
                resolve({
                    errorMessage: 'Công ty dược không tồn tại. Vui lòng làm mới trang.'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

const storeProvider = (data: ProviderData): Promise<DataOptionResponse<Provider>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let newProvider = new Provider();

            newProvider.name = data.name;
            newProvider.email = data.email;
            newProvider.phoneNumber = data.phoneNumber;
            if (data.address) {
                newProvider.address = data.address;
            }

            const errors = await validate(newProvider)

            if (errors.length > 0) {
                return reject({validateError: errors})
            }
            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueCreate(providerRepository, 'phone_number', [data.phoneNumber])
            const [{ exists: existsName }] = await
                checkExistUniqueCreate(providerRepository, 'name', [data.name])
            const [{ exists: existsEmail }] = await
                checkExistUniqueCreate(providerRepository, 'email', [data.email])
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
                })
            }
            if (existsName) {
                errorResponse.push({
                    key: 'name',
                    value: ['Tên công ty dược đã tồn tại.']
                })
            }
            if (existsEmail) {
                errorResponse.push({
                    key: 'email',
                    value: ['Email đã tồn tại.']
                })
            }

            if (errorResponse.length > 0) {
                return reject({validateError: errorResponse})
            }

            await providerRepository.save(newProvider)
            resolve({
                message: 'Thêm thông tin công ti dược thành công.',
                data: newProvider
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateProvider =
    (providerId: number, data: ProviderData): Promise<DataOptionResponse<Provider>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let provider: Provider | null = await providerRepository.findOneBy({ id: providerId });

            if (!provider) {
                return resolve({
                    errorMessage: 'Công ty dược không tồn tại. Vui lòng làm mới trang.'
                });
            }

            provider.name = data.name;
            provider.phoneNumber = data.phoneNumber;
            provider.email = data.email;
            provider.address = data.address ? data.address : '';

            const errors = await validate(provider)

            if (errors.length > 0) {
                return reject({validateError: errors})
            }
            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueUpdate(providerRepository, 'phone_number', [data.phoneNumber, provider.id])
            const [{ exists: existnName }] = await
                checkExistUniqueUpdate(providerRepository, 'name', [data.name, provider.id])
            const [{ exists: existsEmail }] = await
                checkExistUniqueUpdate(providerRepository, 'email', [data.email, provider.id])
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
                })
            }
            if (existnName) {
                errorResponse.push({
                    key: 'name',
                    value: ['Tên công ty dược đã tồn tại.']
                })
            }
            if (existsEmail) {
                errorResponse.push({
                    key: 'email',
                    value: ['Email đã tồn tại.']
                })
            }

            if (errorResponse.length > 0) {
                return reject({validateError: errorResponse})
            }

            await providerRepository.save(provider)
            resolve({
                message: 'Cập nhật thông tin công ti dược thành công.',
                data: provider
            })
        } catch (error) {
            reject(error)
        }
    })
}

const deleteProvider = (providerId: number): Promise<DataOptionResponse<Provider>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let provider: Provider | null = await providerRepository.findOneBy({ id: providerId });

            if (!provider) {
                return resolve({
                    errorMessage: 'Công ty dược không tồn tại. Vui lòng làm mới trang.'
                });
            }

            await providerRepository.delete(providerId);

            resolve({
                message: 'Xóa thông tin công ti dược thành công.',
                data: provider
            })
        } catch (error) {
            reject({errorMessage: 'Công ty dược đã cung cấp thuốc. Không thể xóa thông tin công ty dược này.'});
        }
    })
}

export default {
    getProviders,
    getProvider,
    storeProvider,
    updateProvider,
    deleteProvider
}