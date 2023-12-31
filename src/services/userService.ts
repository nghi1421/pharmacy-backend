import { User } from '../entity/User'
import { AppDataSource } from '../dataSource'
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { Like, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { UserData } from '../global/interfaces/UserData';
import { Role } from '../entity/Role';
import { QueryParam } from '../global/interfaces/QueryParam';
import { DataAndCount, getDataAndCount, getErrors, getMetaData } from '../utils/helper';
import { checkExistUniqueCreate } from '../utils/query';
import generatePassword from 'generate-password'
import mailService from './mailService';
import { Staff } from '../entity/Staff';
import { Customer } from '../entity/Customer';
import config from '../config/config';

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const roleRepository: Repository<Role> = AppDataSource.getRepository(Role)
const customerRepository: Repository<Customer> = AppDataSource.getRepository(Customer)

const getUsers = (queryParams: QueryParam): Promise<DataResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
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
            if (queryParams.orderBy === 'role') {
                order['role'] = { id: queryParams.orderDirection }
            }
            else {
                order[queryParams.orderBy] = queryParams.orderDirection
            }

            const result: DataAndCount = await getDataAndCount(queryParams, userRepository, search, order);

            resolve({
                message: 'Lấy thông tin tài khoản thành công.',
                data: result.data,
                meta: await getMetaData(queryParams, result.total)
            })
        } catch (error) {
            reject(error);
        }
    })
}

const storeUser =
    (data: UserData): Promise<DataOptionResponse<User>> => {
        return new Promise(async (resolve, reject) => {
            try {
                let newUser = new User();
                const role: Role | null = await roleRepository.findOneBy({ id: data.roleId });

                const staff: Staff | null = await staffRepository.findOneBy({ id: data.staffId });
                if (!staff) {
                    return reject({
                        errorMessge: 'Thông tin nhân viên không tồn tại, vui lòng kiểm tra.',
                    });
                }
                if (!role) {
                    return reject({
                        errorMessge: 'Thông tin quyền không tồn tại.',
                    });
                }
                const newPassword = generatePassword.generate({
                    length: 10,
                })
                newUser.role = role;
                newUser.username = data.username;
                newUser.password = newPassword
                newUser.hashPasswrod();

                const errors = await validate(newUser)

                if (errors.length > 0) {
                    return reject({ validateError: getErrors(errors) })
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
                    return reject({ validateError: errorResponse })
                }
                mailService.sendAccount(staff.email, data.username, newPassword)
                await userRepository.save(newUser)

                staff.user = newUser
                await staffRepository.save(staff)
                resolve({
                    message: 'Thêm tài khoản thành công.',
                    data: newUser
                })
            } catch (error) {
                reject(error);
            }
        })
    }

const updateUser =
    (data: UserData): Promise<DataOptionResponse<User>> => {
        return new Promise(async (resolve, reject) => {
            try {
                let user: User | null = await userRepository.findOneBy({ username: data.username });
                const role: Role | null = await roleRepository.findOneBy({ id: data.roleId });

                if (!user) {
                    return reject({
                        errorMessge: 'Tài khoản không tồn tại.',
                    });
                }
                if (user.role.id !== data.roleId) {
                    if (!role) {
                        return reject({
                            errorMessge: 'Quyền không tồn tại.',
                        });
                    }
                    user.role = role;
                }

                user.username = data.username

                await userRepository.save(user)
                resolve({
                    message: 'Cập nhật tài khoản thành công.',
                    data: user
                })
            } catch (error) {
                reject(error);
            }
        })
    }

const deleteUserByStaffId = (staffId: number): Promise<DataOptionResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const staff: Staff | null = await staffRepository.findOneBy({
                id: staffId
            })

            if (!staff || !staff.user) {
                return reject({
                    errorMessage: 'Không tìm thấy tài khoản người dùng.'
                })
            }

            await AppDataSource
                .createQueryBuilder()
                .relation(Staff, "user")
                .of(staff)
                .set(null)

            await userRepository.delete(staff.user.id);

            resolve({
                message: 'Thu hồi và xóa tài khoản thành công.',
                data: staff
            })
        } catch (error) {
            reject(error);
        }
    })
}

const deleteUser = (userId: number): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let user: User = await userRepository.findOneByOrFail({ id: userId });
            const staff = await staffRepository.findOneBy({ user: { id: user.id } })
            if (staff) {
                await AppDataSource
                    .createQueryBuilder()
                    .relation(Staff, "user")
                    .of(staff)
                    .set(null)
            }
            else {
                const customer = await customerRepository.findOneBy({ user: { id: user.id } })
                if (customer) {
                    await AppDataSource
                        .createQueryBuilder()
                        .relation(Customer, "user")
                        .of(customer)
                        .set(null)
                }
            }

            await userRepository.delete(userId);

            resolve({
                message: 'Xóa tài khoản thành công.',
                data: user
            })
        } catch (error) {
            reject(error);
        }
    })
}

const resetPassword = (userId: number): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const user: User = await userRepository.findOneByOrFail({ id: userId });

            user.password = config.defaultPassword
            user.hashPasswrod()

            await userRepository.save(user);

            resolve({
                message: 'Reset mật khẩu tài khoản thành công.',
                data: user
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getUsers,
    storeUser,
    updateUser,
    deleteUserByStaffId,
    deleteUser,
    resetPassword
}