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

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const roleRepository: Repository<Role> = AppDataSource.getRepository(Role)

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
                order['role'] = { id: queryParams.orderDirection}
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
            const role: Role|null = await roleRepository.findOneBy({ id: data.roleId });

            const staff: Staff|null = await staffRepository.findOneBy({ id: data.staffId });
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
            const newPassword =  generatePassword.generate({
                length: 10,
            })
            newUser.role = role;
            newUser.username = data.username;
            newUser.password = newPassword
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
            let user: User|null = await userRepository.findOneBy({ username: data.username });
            const role: Role|null = await roleRepository.findOneBy({ id: data.roleId });
            
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

const deleteUser = (userId: number): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let user: User = await userRepository.findOneByOrFail({ id: userId });

            await userRepository.delete(userId);

            resolve({
                message: 'User deleted successfully',
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
    deleteUser
}