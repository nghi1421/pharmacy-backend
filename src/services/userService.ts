import { User } from '../entity/User'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { Like, Repository, SelectQueryBuilder } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { UserData } from '../global/interfaces/UserData';
import { Role } from '../entity/Role';
import config from '../config/config'
import { QueryParam } from '../global/interfaces/QueryParam';

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
            order[queryParams.orderBy] = queryParams.orderDirection

            let result, total;
            if (queryParams.searchColumns.length !== 0 && queryParams.searchTerm.length !== 0) {
                [result, total] = await userRepository.findAndCount({
                    where: search,
                    take: queryParams.perPage,
                    skip: ((queryParams.page - 1) * queryParams.perPage),
                    order
                })
            }
            else {
                [result, total] = await userRepository.findAndCount({
                take: queryParams.perPage,
                skip: ((queryParams.page - 1) * queryParams.perPage),
                order: {
                        id: 'ASC'
                    }
                })
            }

            // const query: SelectQueryBuilder<User> = userRepository.createQueryBuilder()
            // query.select('*')
            // .leftJoinAndSelect('position_id', 'position')
            // if (queryParams.searchColumns.length !== 0 && queryParams.searchTerm.length !== 0) {
            //     query.where(`${queryParams.searchColumns[0]} LIKE :searchTerm`, { searchTerm: queryParams.searchTerm })
            //     queryParams.searchColumns.forEach((params, index) => {
            //         if (index !== 0) {
            //             query.orWhere(`${params} LIKE :searchTerm`, { searchTerm: queryParams.searchTerm })
            //         }
            //     })
            // }

            // query.orderBy(queryParams.orderBy, queryParams.orderDirection);
            // query.take(queryParams.perPage)
            // query.skip((queryParams.page - 1) * queryParams.perPage)

            // const [result, total] = await query.getManyAndCount()
            // console.log('query', await query.getManyAndCount())

            resolve({
                message: 'Lấy thông tin tài khoản thành công.',
                data: result,
                meta: {
                    page: queryParams.page,
                    perPage: queryParams.perPage,
                    totalPage: total/queryParams.perPage === 0 ? 1 : total/queryParams.perPage,
                    total
                }
            })
        } catch (error) {
            reject(error);
        }
    })
}

const searchUser = (query: Object): Promise<DataResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await userRepository.find({ where: query});
            resolve({
                message: 'Search users successfully',
                data: users
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
    searchUser,
    storeUser,
    updateUser,
    deleteUser
}