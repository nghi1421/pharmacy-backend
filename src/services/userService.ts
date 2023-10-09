import { User } from '../entity/User'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { UserData } from '../global/interfaces/UserData';
import { Role } from '../entity/Role';

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const roleRepository: Repository<Role> = AppDataSource.getRepository(Role)

const getUsers = (): Promise<DataResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await userRepository.find();
            resolve({
                message: 'Get users successfully',
                data: users
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
    (data: UserData): Promise<DataOptionResponse<User>> => {
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
            newUser.password = data.password;
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
    (data: UserData, userId: number, isResetPassword: string): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let user: User|null = await userRepository.findOneBy({ id: userId });

            if (user === null) {
                return reject({
                    errorMessge: 'User not found',
                });
            }

            const role: Role|null = await roleRepository.findOneBy({ id: data.roleId });

            if (user.role.id !== data.roleId) {
                if (role === null) {
                    return reject({
                        errorMessge: 'Role not found',
                    });
                }
                user.role = role;
            }
            
            if (isResetPassword) {
                user.password = data.password;
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