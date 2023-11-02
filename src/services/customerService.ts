import { Customer } from '../entity/Customer'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { CustomerData } from '../global/interfaces/CustomerData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../config/query';

const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer);

const getCustomers = (): Promise<DataResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const customers: Customer[] = await customerRepository.find();
            resolve({
                message: 'Lấy thông tin khách hàng thành công.',
                data: customers
            })
        } catch (error) {
            reject(error);
        }
    })
}

const getCustomer = (customerId: number): Promise<GetDataResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: Customer|null = await customerRepository.findOneBy({ id: customerId });
            if (result) {
                resolve({
                    message: 'Lấy thông tin khách hàng thành công.',
                    data: result
                })
            }
            else {
                reject({
                    errorMessage: 'Phân loại khách hàng không tồn tại. Vui lòng làm mới trang.'
                });
            }
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
                message: 'Tìm kiếm thông tin khách hàng thành công.',
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
            newCustomer.address = data.address

            if (data.dob) {
                newCustomer.dob = new Date(data.dob)
            }

            const errors = await validate(newCustomer)
            
            if (errors.length > 0) {
                return reject({validateError: errors})
            }

            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueCreate(customerRepository, 'phone_number', [newCustomer.phoneNumber])
            const [{ exists: existsEmail }] = await
                checkExistUniqueCreate(customerRepository, 'email', [newCustomer.email])
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
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

            await customerRepository.save(newCustomer)
            resolve({
                message: 'Thêm thông tin khách hàng thành công.',
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
            customer.address = data.address;

            if (data.dob) {
                customer.dob = new Date(data.dob)
            }

            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueUpdate(customerRepository, 'phone_number', [customer.phoneNumber, customer.id])
            const [{ exists: existsEmail }] = await
                checkExistUniqueUpdate(customerRepository, 'email', [customer.email, customer.id])
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
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

            await customerRepository.save(customer)
            resolve({
                message: 'Cập nhật thông tin khách hàng thành công.',
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
                message: 'Xóa thông tin khách hàng thành công.',
                data: customer
            })
        } catch (error) {
            reject({errorMessage: 'Khách hàng đã mua thuốc tại nhà thuốc. Không thể xóa thông tin khách hàng.'});
        }
    })
}

export default {
    getCustomers,
    getCustomer,
    searchCustomer,
    storeCustomer,
    updateCustomer,
    deleteCustomer
}