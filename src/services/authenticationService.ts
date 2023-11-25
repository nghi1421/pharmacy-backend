import { User } from '../entity/User'
import { AppDataSource } from '../dataSource'
import { EntityManager, Repository } from 'typeorm'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import { LoginResponse, LoginCustomerResponse } from '../global/interfaces/LoginResponse'
import { Staff } from '../entity/Staff'
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse'
import { validate, validateOrReject } from 'class-validator'
import { Customer } from '../entity/Customer'
import { SignUpCustomerData } from '../global/interfaces/CustomerData'
import { Role } from '../entity/Role'
import { getErrors } from '../utils/helper'
import { checkExistUniqueCreate } from '../utils/query'

const userRepository: Repository<User> = AppDataSource.getRepository(User)
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff)
const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer)
const roleRepository: Repository<Role> = AppDataSource.getRepository(Role)

const login = async (username: string, password: string): Promise<LoginResponse> => {
    return new Promise(async (resolve, reject) => {
        const user: User|null = await userRepository.findOneBy({ username: username })
        if (user !== null && user.checkPassword(password)) {
            const staff: Staff|null = await staffRepository.findOneBy({ user: { id: user.id }});
            if (!staff) {
                reject({errorMessage: 'Thông tin nhân viên không tồn tại.'})
                return
            }
            const accessToken = jwt.sign({
                userId: user.id,
                roleId: user.role.id,
                staffId: staff.id
            }, config.accessKey, { expiresIn: config.expiryAccessToken });
            const refreshToken = jwt.sign({
                userId: user.id,
                roleId: user.role.id,
                staffId: staff.id
            }, config.refreshKey, { expiresIn: config.expiryRefreshToken });

            resolve({
                response: {
                    message: 'Đăng nhập thành công.',
                    data: {
                        id: user.id,
                        username: user.username,
                        staff: staff,
                        role: user.role
                    },
                    accessToken,
                },
                refreshToken 
            })
        }
        else {
            reject({
                errorMessage: 'Tên đăng nhập hoặc mật khẩu không hợp lệ.'
            })
        }
    })
}

const changePassword =
    (username: string, newPassword: string, oldPassword: string): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const user: User | null = await userRepository.findOneBy({ username: username });
            
            if (!user) {
                reject({ errorMessage: 'Tên đăng nhập hoặc mật khẩu không khớp.' });
            } else {
                if (user.checkPassword(oldPassword)) {
                    user.password = newPassword;
                    user.hashPasswrod();

                    await validateOrReject(user);
                    await userRepository.save(user);

                    resolve({
                        message: 'Đổi mật khẩu thành công.',
                        data: user,
                    })
                }
                else {
                    reject({ errorMessage: 'Mật khẩu không hợp lệ.' });
                }
            }
        } catch (error) {
            reject({errorMessage: error})
        }
    })
}

const loginCustomer = (username: string, password: string, deviceToken: string)
    : Promise<LoginCustomerResponse> => {
    return new Promise(async (resolve, reject) => {
        const user: User|null = await userRepository.findOneBy({ username: username })
        if (user !== null && user.checkPassword(password)) {
            const customer: Customer|null = await customerRepository.findOneBy({ user: { id: user.id }});
            if (!customer) {
                reject({errorMessage: 'Thông tin khách hàng không tồn tại.'})
                return
            }
            const accessToken = jwt.sign({
                userId: user.id,
                roleId: user.role.id,
                customerId: customer.id
            }, config.accessKey, { expiresIn: config.expiryRefreshToken });

            user.deviceToken = deviceToken
            await userRepository.save(user);

            resolve({
                response: {
                    message: 'Đăng nhập thành công.',
                    data: {
                        id: user.id,
                        username: user.username,
                        customer: customer,
                        role: user.role
                    }
                },
                accessToken,
        })
        }
        else {
            reject({
                errorMessage: 'Tên đăng nhập hoặc mật khẩu không hợp lệ.'
            })
        }
    })
}

const verifyPhoneNumber = (phoneNumber: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const customer: Customer | null = await customerRepository.findOneBy({ phoneNumber: phoneNumber });
            const otpCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
            console.log('This is OTP CODE_______________-__:', otpCode)
            if (customer) {
                if (customer.user) {
                    reject({
                        errorMessage: 'Số điện thoại đã được sử dụng.'
                    })
                }
                else {
                    resolve({
                        message: 'Lấy mã OTP thành công.',
                        otpCode,
                        data: customer,
                    })
                }
            }
            else {
                resolve({
                    message: 'Lấy mã OTP thành công.',
                    otpCode,
                })
            }
        }
        catch (error) {
            reject(error)
        }
    })
}

const signUpForCustomer = (data: SignUpCustomerData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.password !== data.confirmationPassword) {
                return reject({
                    errorMessge: 'Mật khẩu xác nhận không khớp.',
                });
            }

            const newUser = new User();
                const role: Role|null = await roleRepository.findOneBy({ id: 3 });

                if (role === null) {
                    return reject({
                        errorMessge: 'Thông tin quyền không tồn tại.',
                    });
                }

                newUser.role = role;
                newUser.username = data.username;
                newUser.password = data.password;
                newUser.deviceToken = data.deviceToken;
                newUser.hashPasswrod();

                const errors = await validate(newUser)
            
                if (errors.length > 0) {
                    return reject({validateError: getErrors(errors)})
                }

                const errorResponse = []
                const [{ exists: existsUsername }] = await
                    checkExistUniqueCreate(userRepository, 'username', data.username)

                if (existsUsername) {
                    errorResponse.push({
                        key: 'username',
                        value: ['Tên đăng nhập đã tồn tại.']
                    })
                }

                if (errorResponse.length > 0) {
                    return reject({validateError: errorResponse})
            }
            
            const customer: Customer | null = await customerRepository.findOneBy({ phoneNumber: data.phoneNumber })
            
            if (customer) {
                await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                    await transactionalEntityManager.save(newUser)
                    customer.user = newUser
                    await transactionalEntityManager.save(customer)
                })

                resolve({
                    message: 'Đăng ký thành công.',
                    data: customer
                })
            } 
            else {
                let newCustomer = new Customer();

                newCustomer.name = data.name;
                newCustomer.phoneNumber = data.phoneNumber;
                newCustomer.gender = data.gender;
                newCustomer.address = data.address

                const customerErrors = await validate(newCustomer)
                
                if (customerErrors.length > 0) {
                    return reject({validateError: customerErrors})
                }

                await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                    await transactionalEntityManager.save(newCustomer)

                    await transactionalEntityManager.save(newUser)
                })

                resolve({
                    message: 'Đăng ký thành công.',
                    data: customer
                })
            }
            
        }
        catch (error) {
            reject(error)
        }
    })
}

const forgotPassword = (phoneNumber: string) => {
    return new Promise(async (resolve, reject) => {
       try {
            const customer: Customer | null = await customerRepository.findOneBy({ phoneNumber: phoneNumber });
            if (customer && customer.user) {
                resolve({
                    otpCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
                })

            }
            else {
                resolve({
                    message: 'Số điện thoại không hợp lệ.'
                })
            }
        }
        catch (error) {
            reject(error)
        }
    })
}

export default{
    login,
    changePassword,
    loginCustomer,
    verifyPhoneNumber,
    signUpForCustomer,
    forgotPassword
}