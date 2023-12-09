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
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../utils/query'
import mailService from './mailService'
import { ProfileData } from '../global/interfaces/ProfileData'

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

                    const errors = await validate(user);
                    if (errors.length > 0) {
                        return reject({validateError: getErrors(errors)})
                    }

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
            reject(error)
        }
    })
    }

const changePasswordCustomer =
    (phoneNumber: string, newPassword: string, oldPassword: string): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const customer: Customer | null = await customerRepository.findOneBy({ phoneNumber: phoneNumber });
            
            if (!customer) {
                reject({ errorMessage: 'Số điện thoại không tồn tại.' });
            } else {
                const user = customer.user
                if (user) {
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
                else {
                    reject({ errorMessage: 'Khách hàng chưa tạo tài khoản.'})
                }
            }
        } catch (error) {
            reject(error)
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

const verifyEmail = (email: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const customer: Customer | null = await customerRepository.findOneBy({ email: email });
            const otpCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
            console.log('This is OTP CODE_______________-__:', otpCode)
            if (customer) {
                if (customer.user) {
                    reject({
                        errorMessage: 'Email đã được sử dụng.'
                    })
                }
                else {
                    mailService.sendOtp(customer.email, otpCode)
                    resolve({
                        message: 'Gửi OTP thành công. Vui lòng kiểm tra email.',
                        otpCode,
                        data: customer,
                    })
                }
            }
            else {
                mailService.sendOtp(email, otpCode)
                resolve({
                    message: 'Gửi OTP thành công. Vui lòng kiểm tra email.',
                    otpCode,
                })
            }
        }
        catch (error) {
            reject(error)
        }
    })
}

const checkAndSendOTPCode = (email: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const customer: Customer | null = await customerRepository.findOneBy({ email: email });
            const otpCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
            console.log('This is OTP CODE_______________-__:', otpCode)
            if (customer) {
                reject({
                    errorMessage: 'Email đã được sử dụng.'
                })
            }
            else {
                mailService.sendOtp(email, otpCode)
                resolve({
                    message: 'Gửi OTP thành công. Vui lòng kiểm tra email.',
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
                    const user = await transactionalEntityManager.save(newUser)
                    customer.user = user
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

                await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                    const user = await transactionalEntityManager.save(newUser)
                    newCustomer.user = user
                    await transactionalEntityManager.save(newCustomer)

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

const forgotPassword = (email: string) => {
    return new Promise(async (resolve, reject) => {
       try {
            const customer: Customer | null = await customerRepository.findOneBy({ email });
            const staff: Staff | null = await staffRepository.findOneBy({ email });
           
            if ((customer && customer.user) || (staff && staff.user)) {
                const otpCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                mailService.sendOtp(email, otpCode)
                resolve({
                    message: 'Gửi OTP thành công. Vui lòng kiểm tra email.',
                    otpCode: otpCode,
                })
            }
            else {
                resolve({
                    message: 'Email không hợp lệ.'
                })
            }
        }
        catch (error) {
            reject(error)
        }
    })
}

const updateProfile = (data: ProfileData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const staff: Staff | null = await staffRepository.findOneBy({ id: data.id })
            if (!staff) {
                return reject({ errorMessage: 'Nhân viên không tồn tại.'})
            }
            staff.name = data.name
            staff.email = data.email
            staff.phoneNumber = data.phoneNumber
            staff.gender = data.gender
            if (data.dob) {
                 staff.dob = new Date(data.dob)
            }
            staff.address = data.address

            const errors = await validate(staff)
            if (errors.length > 0) {
                return reject({validateError: errors})
            }

            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueUpdate(staffRepository, 'phone_number', [data.phoneNumber, staff.id])
            const [{ exists: existsEmail }] = await
                checkExistUniqueUpdate(staffRepository, 'email', [data.email, staff.id])
            
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

            await staffRepository.save(staff)
            resolve({
                message: 'Cập nhật thông tin thành công.',
                data: staff
            })
        }
        catch (error) {
            reject(error)
        }
    })
}

const setNewPassword = (password: string, email: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const customer: Customer | null = await customerRepository.findOneBy({ email });
            const staff: Staff | null = await staffRepository.findOneBy({ email });
           
            if ((customer && customer.user) || (staff && staff.user)) {
                let user = customer ? customer.user : undefined
                user = !user && staff ? staff.user : undefined

                if (!user) {
                    return reject({errorMessage: 'Không tìm thấy tài khoản.'})
                }
                user.password = password;
                user.hashPasswrod();
                await userRepository.save(user);
                resolve({
                    message: 'Thiết lập mật khẩu mới thành công.',
                })
            }
            else {
                resolve({
                    message: 'Email không hợp lệ.'
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
    updateProfile,
    setNewPassword,
    checkAndSendOTPCode,
    loginCustomer,
    verifyEmail,
    signUpForCustomer,
    forgotPassword,
    changePasswordCustomer
}