import { Provider } from '../entity/Provider'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { ProviderData } from '../global/interfaces/ProviderData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';

const providerRepository: Repository<Provider> = AppDataSource.getRepository(Provider);

const getProviders = (): Promise<DataResponse<Provider>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const providers = await providerRepository.find();
            resolve({
                message: 'Lấy thông tin công ty dược thành công.',
                data: providers
            })
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

const searchProvider = (query: Object): Promise<DataResponse<Provider>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const providers = await providerRepository.find({ where: query});
            resolve({
                message: 'Tìm kiếm thông tin công ty dược thành công.',
                data: providers
            })
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
            newProvider.address = data.address ? data.address : '';

            await validateOrReject(newProvider)

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

            await validateOrReject(provider)

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
            reject(error);
        }
    })
}

export default {
    getProviders,
    getProvider,
    searchProvider,
    storeProvider,
    updateProvider,
    deleteProvider
}