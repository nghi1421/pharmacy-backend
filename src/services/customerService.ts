import { Customer } from '../entity/Customer'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { CustomerData } from '../global/interfaces/CustomerData';
import { Like, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../utils/query';
import { QueryParam } from '../global/interfaces/QueryParam';
import { DataAndCount, getDataAndCount, getMetaData } from '../utils/helper';

const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer);

const getCustomers = (queryParams: QueryParam | undefined): Promise<DataResponse<Customer>> => {
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

                const result: DataAndCount = await getDataAndCount(queryParams, customerRepository, search, order);
        
                resolve({
                    message: 'Lấy thông tin khách hàng thành công.',
                    data: result.data,
                    meta: await getMetaData(queryParams, result.total)
                })    
            }
            else {
                const data: Customer[] = await customerRepository.find();

                resolve({
                    message: 'Lấy thông tin khách hàng thành công.',
                    data
                })  
            }
        } catch (error) {
            reject(error);
        }
    })
}

const getCustomerByPhoneNumber = (phoneNumber: string): Promise<GetDataResponse<Customer>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: Customer|null = await customerRepository.findOneBy({ phoneNumber: phoneNumber });
            if (result) {
                resolve({
                    message: 'Lấy thông tin khách hàng thành công.',
                    data: result
                })
            }
            else {
                reject({
                    errorMessage: 'Không tìm thấy thông tin nhân viên.'
                });
            }
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
                    errorMessage: 'Thông tin khách hàng không tồn tại. Vui lòng làm mới trang.'
                });
            }
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
            newCustomer.phoneNumber = data.phoneNumber;
            newCustomer.email = data.email;
            newCustomer.gender = data.gender;
            newCustomer.address = data.address

            const errors = await validate(newCustomer)
            
            if (errors.length > 0) {
                return reject({validateError: errors})
            }

            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueCreate(customerRepository, 'phone_number', [newCustomer.phoneNumber])
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
                })
            }

            const [{ exists: existsEmail }] = await
                checkExistUniqueCreate(customerRepository, 'email', [newCustomer.email])
            
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
            customer.email = data.email
            customer.gender = data.gender;
            customer.address = data.address;

            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueUpdate(customerRepository, 'phone_number', [customer.phoneNumber, customer.id])
            
            const [{ exists: existsEmail }] = await
                checkExistUniqueUpdate(customerRepository, 'email', [customer.email, customer.id])
            
            if (existsEmail) {
                errorResponse.push({
                    key: 'email',
                    value: ['Email đã tồn tại.']
                })
            }
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
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
    getCustomerByPhoneNumber,
    storeCustomer,
    updateCustomer,
    deleteCustomer
}