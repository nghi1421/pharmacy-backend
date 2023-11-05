import { User } from '../entity/User'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { Like, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { UserData } from '../global/interfaces/UserData';
import { Role } from '../entity/Role';
import config from '../config/config'
import { QueryParam } from '../global/interfaces/QueryParam';
import { DataAndCount, getDataAndCount, getMetaData } from '../config/helper';

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const roleRepository: Repository<Role> = AppDataSource.getRepository(Role)

const getUsers = (queryParams: QueryParam): Promise<DataResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const search  = queryParams.searchColumns.map((param) => {
                const object:any = {}
                    object[param] = Like(`%${queryParams.searchTerm}%`)
                    return object
                }
            )
            
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
    (data: UserData, isDefaultPassword: boolean): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let newUser = new User();
            const role: Role|null = await roleRepository.findOneBy({ id: data.roleId });

            if (role === null) {
                return reject({
                    errorMessge: 'Role not found',
                });
            }

            newUser.role = role;
            newUser.username = data.username;
            newUser.password = isDefaultPassword ? config.defaultPassword : data.password
            newUser.hashPasswrod();

            await validateOrReject(newUser)

            await userRepository.save(newUser)
            resolve({
                message: 'Insert User successfully',
                data: newUser
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateUser =
    (data: UserData, userId: number, isResetPassword: boolean): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let user: User|null = await userRepository.findOneBy({ id: userId });
            const role: Role | null = await roleRepository.findOneBy({ id: data.roleId });
            
            if (user === null) {
                return reject({
                    errorMessge: 'User not found.',
                });
            }
            if (user.role.id !== data.roleId) {
                if (role === null) {
                    return reject({
                        errorMessge: 'Role not found.',
                    });
                }
                user.role = role;
            }
            if (isResetPassword) {
                user.password = config.defaultPassword;
                user.hashPasswrod();
            }

            user.username = data.username;

            await validateOrReject(user)

            await userRepository.save(user)
            resolve({
                message: 'Update user successfully',
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