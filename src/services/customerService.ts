import { Customer } from '../entity/Customer'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { CustomerData } from '../global/interfaces/CustomerData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';

const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer);

const getCustomers = (): Promise<DataResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const customers: Customer[] = await customerRepository.find();
            resolve({
                message: 'Get customers successfully',
                data: customers
            })
        } catch (error) {
            reject(error);
        }
    })
}

const searchCustomer = (query: Object): Promise<DataResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const customers: Customer[] = await customerRepository.find({ where: query});
            resolve({
                message: 'Search customers successfully',
                data: customers
            })
        } catch (error) {
            reject(error);
        }
    })
}

const storeCustomer = (data: CustomerData): Promise<DataOptionResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let newCustomer = new Customer();

            newCustomer.name = data.name;
            newCustomer.email = data.email;
            newCustomer.phoneNumber = data.phoneNumber;
            newCustomer.gender = data.gender;
            newCustomer.address = data.address ? data.address : '';

            if (data.dob) {
                newCustomer.dob = new Date(data.dob)
            }

            const errors = await validate(newCustomer)
            
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
            }

            await customerRepository.save(newCustomer)
            resolve({
                message: 'Insert customer successfully',
                data: newCustomer
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateCustomer = (customerId: number, data: CustomerData): Promise<DataOptionResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let customer = await customerRepository.findOneByOrFail({ id: customerId });

            customer.name = data.name;
            customer.phoneNumber = data.phoneNumber;
            customer.gender = data.gender;
            customer.email = data.email;
            customer.address = data.address ? data.address : '';

            if (data.dob) {
                customer.dob = new Date(data.dob)
            }

            const errors = await validate(customer)
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
            }

            await customerRepository.save(customer)
            resolve({
                message: 'Update customer successfully',
                data: customer
            })
        } catch (error) {
            reject(error)
        }
    })
}

const deleteCustomer = (customerId: number): Promise<DataOptionResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let customer: Customer = await customerRepository.findOneByOrFail({ id: customerId });

            await customerRepository.delete(customerId);

            resolve({
                message: 'Customer deleted successfully',
                data: customer
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getCustomers,
    searchCustomer,
    storeCustomer,
    updateCustomer,
    deleteCustomer
}