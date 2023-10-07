import { Provider } from '../entity/Provider'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { ProviderData } from '../global/interfaces/ProviderData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';

const providerRepository: Repository<Provider> = AppDataSource.getRepository(Provider);

const getProviders = (): Promise<DataResponse<Provider>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const providers = await providerRepository.find();
            resolve({
                message: 'Get providers successfully',
                data: providers
            })
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
                message: 'Search providers successfully',
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

            const errors = await validate(newProvider)
            
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
            }

            await providerRepository.save(newProvider)
            resolve({
                message: 'Insert Provider successfully',
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
            let provider = await providerRepository.findOneByOrFail({ id: providerId });

            provider.name = data.name;
            provider.phoneNumber = data.phoneNumber;
            provider.email = data.email;
            provider.address = data.address ? data.address : '';

            const errors = await validate(provider)
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
            }

            await providerRepository.save(provider)
            resolve({
                message: 'Update provider successfully',
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
            let provider: Provider = await providerRepository.findOneByOrFail({ id: providerId });

            await providerRepository.delete(providerId);

            resolve({
                message: 'Provider deleted successfully',
                data: provider
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getProviders,
    searchProvider,
    storeProvider,
    updateProvider,
    deleteProvider
}