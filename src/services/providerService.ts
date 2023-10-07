import { Provider } from '../entity/Provider'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { ProviderData } from '../global/interfaces/ProviderData';

const providerRepository = AppDataSource.getRepository(Provider);

const getProviders = () => {
    return new Promise<DataResponse<Provider>>(async (resolve, reject) => {
        try {
            const staffs = await providerRepository.find();
            resolve({
                message: 'Get providers successfully',
                data: staffs
            })
        } catch (error) {
            reject(error);
        }
    })
}

const searchProvider = (query: Object) => {
    return new Promise<DataResponse<Provider>>(async (resolve, reject) => {
        try {
            const staff = await providerRepository.find({ where: query});
            resolve({
                message: 'Search Providers successfully',
                data: staff
            })
        } catch (error) {
            reject(error);
        }
    })
}

const storeProvider = (data: ProviderData) => {
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

const updateProvider = (providerId: number, data: ProviderData) => {
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

const deleteProvider = (providerId: number) => {
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